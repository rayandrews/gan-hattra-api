'use strict';

const express = require('express');
const auth = require('../components/auth.js');
const validators = require('./hattra.validators.js');
const errors = require('http-errors');
const queries = require('./hattra.queries.js');
const config = require('config');
const router = express.Router();

/** Custom auth middleware that checks whether the accessing kestrad is this kestrad's owner or a supervisor. */
const isOwnerOrPuskesmasAndHigher = auth.createMiddlewareFromPredicate(
  (user, req) => {
    return (
      user.username === req.params.username ||
      auth.predicates.isPuskesmasOrHigher(user)
    );
  }
);

/** Custom auth middleware that checks whether the accessing kestrad is this kestrad's owner or a supervisor. */
const isOwnerOrKestradAndHigher = auth.createMiddlewareFromPredicate(
  (user, req) => {
    return (
      user.username === req.params.username ||
      auth.predicates.isKestradOrHigher(user)
    );
  }
);

/**
 * Get a list of hattra.
 * @name Get hattra
 * @route {GET} /hattra
 */
router.get(
  '/hattra',
  auth.middleware.isKestradOrHigher,
  validators.listHattra,
  (req, res, next) => {
    const isAdmin = auth.predicates.isAdmin(req.user);
    if (isAdmin) {
      return queries
        .listHattra(
          req.query.search,
          req.query.page,
          req.query.perPage,
          req.query.sort
        )
        .then(kestrad => {
          return res.json(kestrad);
        })
        .catch(next);
    } else if (auth.predicates.isProvinsi(req.user)) {
      return queries
        .listHattraByProvinsi(
          req.query.search,
          req.query.page,
          req.query.perPage,
          req.query.sort,
          req.user.username
        )
        .then(kestrad => {
          return res.json(kestrad);
        })
        .catch(next);
    } else if (auth.predicates.isKota(req.user)) {
      return queries
        .listHattraByKota(
          req.query.search,
          req.query.page,
          req.query.perPage,
          req.query.sort,
          req.user.username
        )
        .then(kestrad => {
          return res.json(kestrad);
        })
        .catch(next);
    } else if (auth.predicates.isPuskesmas(req.user)) {
      return queries
        .listHattraByPuskesmas(
          req.query.search,
          req.query.page,
          req.query.perPage,
          req.query.sort,
          req.user.username
        )
        .then(kestrad => {
          return res.json(kestrad);
        })
        .catch(next);
    } else {
      return queries
        .listHattraByKestrad(
          req.query.search,
          req.query.page,
          req.query.perPage,
          req.query.sort,
          req.user.username
        )
        .then(kestrad => {
          return res.json(kestrad);
        })
        .catch(next);
    }
  }
);

/**
 * Get a list of hattra predecessor username.
 * @name Get hattra
 * @route {GET} /hattra
 */
router.get(
  '/hattra/byUser/:username',
  auth.middleware.isKestradOrHigher,
  (req, res, next) => {
    return queries
      .listHattraByUsername(
        req.query.search,
        req.query.page,
        req.query.perPage,
        req.query.sort,
        req.user.username,
        req.user.role,
        req.params.username
      )
      .then(result => {
        return res.json(result);
      })
      .catch(next);
  }
);

/**
 * Get a list of hattra for searching.
 * @name Search hattra
 * @route {GET} /hattra/search
 */
router.get('/hattra/search', auth.middleware.isLoggedIn, (req, res, next) => {
  return queries
    .searchHattra(req.query.search)
    .then(result => {
      return res.json(result);
    })
    .catch(next);
});

/**
 * Get specific hattra information for the specified id.
 * @name Get hattra info.
 * @route {GET} /hattra/:id
 */
router.get('/hattra/:id', isOwnerOrKestradAndHigher, (req, res, next) => {
  return queries
    .getSpecificHattra(req.params.id)
    .then(user => {
      if (!user) return next(new errors.NotFound('id not found.'));
      return res.json(user);
    })
    .catch(next);
});

/**
 * Updates hattra information for the given id.
 * @name Update hattra
 * @route {PATCH} /hattra/:id
 */
router.patch(
  '/hattra/:id_hattra',
  auth.middleware.isPuskesmas,
  validators.updateNamaHattra,
  (req, res, next) => {
    let hattraUpdates = {
      nama: req.body.hattra.nama,
      ijin_hattra: req.body.hattra.ijin_hattra
    };

    return queries
      .updateNamaHattra(req.params.id_hatra, hattraUpdates, req.user.username)
      .then(affectedRowCount => {
        return res.json({ affectedRowCount: affectedRowCount });
      })
      .catch(next);
  }
);

/**
 * Get a list of hattra
 * @name Get hattra
 * @route {GET} /hattra/byLayanan/:id
 */
router.get(
  '/hattra/byLayanan/:id',
  auth.middleware.isKestradOrHigher,
  validators.listHattra,
  (req, res, next) => {
    return queries
      .listHattraByLayanan(
        req.query.search,
        req.query.page,
        req.query.perPage,
        req.query.sort,
        req.params.id
      )
      .then(kestrad => {
        if (!kestrad) {
          return next(new errors.NotFound('Hattra not found'));
        }
        return res.json(kestrad);
      })
      .catch(next);
  }
);

/**
 * Updates hattra verification for the given id.
 * @name Update hattra verification
 * @route {PATCH} /hattra/:id/verification
 */

router.patch(
  '/hattra/:id_hattra/verification/:unverify?',
  auth.middleware.isKota,
  validators.updateVerifikasiHattra,
  (req, res, next) => {
    let hattraUpdates;

    if (!req.params.unverify) {
      hattraUpdates = {
        verified: 'active'
      };
    }

    if (req.params.unverify && req.params.unverify === 'unverify') {
      hattraUpdates = {
        verified: 'disabled'
      };
    }

    return queries
      .updateVerifikasiHattra(
        req.params.id_hattra,
        hattraUpdates,
        req.user.username
      )
      .then(affectedRowCount => {
        return res.json({ affectedRowCount: affectedRowCount });
      })
      .catch(next);
  }
);

module.exports = router;
