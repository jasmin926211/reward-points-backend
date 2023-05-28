const BadRequestException = require('./BadRequestException');
const InternalServerException = require('./InternalServerException');
const ResourceNotFoundException = require('./ResourceNotFoundException');
const ConflictException = require('./ConflictException');
const ForbiddenException = require('./ForbiddenException');
const UnauthorizedException = require('./UnauthorizedException');
const NotAllowedException = require('./NotAllowedException');

module.exports = {
  BadRequestException,
  InternalServerException,
  ResourceNotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  NotAllowedException
}