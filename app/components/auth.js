'use strict';

/**
 * Contains custom [Express](https://expressjs.com/) predicates and middleware for authentication and authorization.
 * @module app/components/auth
 */

const errors = require('http-errors');

const predicates = {
  isAdmin: user => user && user.role && user.role === 'admin',
  isProvinsi: user => user && user.role && user.role === 'provinsi',
  isKota: user => user && user.role && user.role === 'kota',
  isPuskesmas: user => user && user.role && user.role === 'puskesmas',
  isKestrad: user => user && user.role && user.role === 'kestrad',
  isUser: user => user && user.role && user.role === 'user',
  isActive: user => user && user.status && user.status === 'active',
  isAwaitingValidation: user =>
    user && user.status && user.status === 'awaiting-validation',
  isDisabled: user => user && user.status && user.status === 'disabled',
  isProvinsiOrHigher: user =>
    user && user.role && (user.role === 'admin' || user.role === 'provinsi'),
  isKotaOrHigher: user =>
    user &&
    user.role &&
    (user.role === 'admin' || user.role === 'provinsi' || user.role === 'kota'),
  isPuskesmasOrHigher: user =>
    user &&
    user.role &&
    (user.role === 'admin' ||
      user.role === 'provinsi' ||
      user.role === 'kota' ||
      user.role === 'puskesmas'),
  isKestradOrHigher: user =>
    user &&
    user.role &&
    (user.role === 'admin' ||
      user.role === 'provinsi' ||
      user.role === 'kota' ||
      user.role === 'puskesmas' ||
      user.role === 'kestrad')
};

/**
 * Creates an Express middleware from the given predicate function.
 * The created middleware first checks whether the current user is logged in.
 * It throws a HTTP Unauthorized (401) error otherwise.
 * Then it checks the given predicate.
 * @param predicate {function} A function that receives a user object as its first argument
 *   and the current request as its second argument,
 *   and returns true to continue. Return false to make the middleware throw a HTTP Forbidden (403) error.
 *   Accepts a sync and async (returns a promise) function for predicate.
 * @returns An Express middleware corresponding to the given predicate.
 */
const createMiddlewareFromPredicate = predicate => {
  return function (req, res, next) {
    if (!req.user) return next(new errors.Unauthorized());
    return Promise.resolve(predicate(req.user, req))
      .then(predicateResult => {
        if (!predicateResult) throw new errors.Forbidden();
        return next();
      })
      .catch(next);
  };
};

/* Common middleware for authorization check */
const middleware = {
  /**
   * Middleware that checks whether the user is logged in. Throws a HTTP Unauthorized (401) error otherwise.
   */
  isLoggedIn: (req, res, next) => {
    if (!req.user) return next(new errors.Unauthorized('Not logged in.'));
    return next();
  },

  /**
   * Middleware that checks whether the user is a supervisor.
   */
  isSupervisor: createMiddlewareFromPredicate(predicates.isSupervisor),

  /**
   * Middleware that checks whether the user is an admin.
   */
  isAdmin: createMiddlewareFromPredicate(predicates.isAdmin),

  /**
   * Middleware that checks whether the user is an user.
   */
  isUser: createMiddlewareFromPredicate(predicates.isUser),
  /**
   * Middleware that checks whether the user is a puskesmas.
   */
  isPuskesmas: createMiddlewareFromPredicate(predicates.isPuskesmas),
  /**
   * Middleware that checks whether the user is a kota.
   */
  isKota: createMiddlewareFromPredicate(predicates.isKota),

  /**
   * Middleware that checks whether the user is a kestrad.
   */
  isKestrad: createMiddlewareFromPredicate(predicates.isKestrad),

  /**
   * Middleware that checks whether the user is Provinsi or higher (admin).
   */
  isProvinsiOrHigher: createMiddlewareFromPredicate(
    predicates.isProvinsiOrHigher
  ),

  /**
   * Middleware that checks whether the user is Kota or higher (admin).
   */
  isKotaOrHigher: createMiddlewareFromPredicate(predicates.isKotaOrHigher),

  /**
   * Middleware that checks whether the user is Puskesmas or higher (admin).
   */
  isPuskesmasOrHigher: createMiddlewareFromPredicate(
    predicates.isPuskesmasOrHigher
  ),

  /**
   * Middleware that checks whether the user is Puskesmas or higher (admin).
   */
  isKestradOrHigher: createMiddlewareFromPredicate(predicates.isKestradOrHigher)
};

module.exports = {
  predicates: predicates,
  createMiddlewareFromPredicate: createMiddlewareFromPredicate,
  middleware: middleware
};
