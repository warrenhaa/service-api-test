module.exports = {
  swagger: '2.0',
  info: {
    description: 'This is a sample server Service Api server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).',
    version: '1.0.0',
    title: 'Swagger Service-Api',
    termsOfService: 'http://swagger.io/terms/',
    contact: {
      email: 'apiteam@swagger.io',
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  host: 'service-api.swagger.io',
  basePath: '/api/v1',
  tags: [],
  schemes: [
    'http',
  ],
  paths: {},
  securityDefinitions: {},
  definitions: {
    ApiResponse: {
      type: 'object',
      properties: {
        code: {
          type: 'integer',
          format: 'int32',
        },
        type: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
      },
    },
  },
  externalDocs: {
    description: 'Find out more about Swagger',
    url: 'http://swagger.io',
  },
};
