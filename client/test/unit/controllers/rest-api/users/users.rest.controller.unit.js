/*
  Unit tests for the REST API handler for the /users endpoints.
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const mongoose = require('mongoose')

// Local support libraries
const adapters = require('../../../mocks/adapters')
const UserController = require('../../../../../src/controllers/rest-api/users/controller')
const UseCasesMock = require('../../../mocks/use-cases')

let uut
let sandbox
let ctx

const mockContext = require('../../../../unit/mocks/ctx-mock').context

describe('Users', () => {
  beforeEach(() => {
    const useCases = new UseCasesMock()

    uut = new UserController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  after(() => {
    mongoose.connection.close()
  })

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new UserController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /users REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new UserController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /users REST Controller.'
        )
      }
    })
  })

  describe('#POST /users', () => {
    describe('#constructor', () => {
      it('should throw an error if adapters are not passed in', () => {
        try {
          uut = new UserController()

          assert.fail('Unexpected code path')
        } catch (err) {
          assert.include(
            err.message,
            'Instance of Adapters library required when instantiating /users REST Controller.'
          )
        }
      })
    })

    it('should return 422 status on biz logic error', async () => {
      try {
        await uut.createUser(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should return 200 status on success', async () => {
      ctx.request.body = {
        user: {
          email: 'test02@test.com',
          password: 'test',
          name: 'test02'
        }
      }

      await uut.createUser(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.property(ctx.response.body, 'user')
      assert.property(ctx.response.body, 'token')
    })
  })

  describe('GET /users', () => {
    it('should return 422 status on arbitrary biz logic error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.user, 'getAllUsers')
          .rejects(new Error('test error'))

        await uut.getUsers(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      await uut.getUsers(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.property(ctx.response.body, 'users')
    })
  })

  describe('GET /users/:id', () => {
    it('should return 422 status on arbitrary biz logic error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.useCases.user, 'getUser').rejects(new Error('test error'))

        await uut.getUser(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
        assert.include(err.message, 'test error')
      }
    })

    it('should return 200 status on success', async () => {
      // Mock dependencies
      sandbox.stub(uut.useCases.user, 'getUser').resolves({ _id: '123' })

      await uut.getUser(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.property(ctx.response.body, 'user')
    })

    it('should return other error status passed by biz logic', async () => {
      try {
        // Mock dependencies
        const testErr = new Error('test error')
        testErr.status = 404
        sandbox.stub(uut.useCases.user, 'getUser').rejects(testErr)

        await uut.getUser(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 404)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('PUT /users/:id', () => {
    it('should return 422 if no input data given', async () => {
      try {
        await uut.updateUser(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should return 200 on success', async () => {
      ctx.body = {
        user: {}
      }
      ctx.request.body = {
        user: {}
      }

      // Mock dependencies
      sandbox.stub(uut.useCases.user, 'updateUser').resolves({})

      await uut.updateUser(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.property(ctx.response.body, 'user')
    })
  })

  describe('DELETE /users/:id', () => {
    it('should return 422 if no input data given', async () => {
      try {
        await uut.deleteUser(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should return 200 status on success', async () => {
      const existingUser = {}

      ctx.body = {
        user: existingUser
      }

      await uut.deleteUser(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)
    })
  })

  describe('validateEmail()', () => {
    it('should return false if email is not provided ', async () => {
      const isEmail = await uut.validateEmail()
      assert.isFalse(isEmail)
    })
    it('should return false if the input is not an email format ', async () => {
      const isEmail = await uut.validateEmail(1)
      assert.isFalse(isEmail)
    })
    it('should return true if the input has email format ', async () => {
      const email = 'email@email.com'
      const isEmail = await uut.validateEmail(email)
      assert.isTrue(isEmail)
    })
  })

  describe('#handleError', () => {
    it('should still throw error if there is no message', () => {
      try {
        const err = {
          status: 404
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'Not Found')
      }
    })

    it('should  throw error ', () => {
      try {
        const err = {
          message: 'Not Found',
          status: 404
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'Not Found')
      }
    })
  })
})
