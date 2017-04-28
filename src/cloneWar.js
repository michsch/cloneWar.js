(function (root, factory) {
  root.objectClone = factory();
})(window, function () {
  'use strict';

  objectClone = function (originalObject) {
    return new ObjectClone(originalObject);
  }

  function ObjectClone (originalObject) {
    this._originalObject = originalObject;
    this._filter = [];
    this._map = [];
    this._traversedObjects = [];
  }

  ObjectClone.prototype = {
    constructor: ObjectClone,

    filter: function (filterFunction) {
      this._throwExceptionOnInvalidArgument(filterFunction, 'function');

      this._filter.push(filterFunction);
    },

    map: function (mapFunction) {
      this._throwExceptionOnInvalidArgument(mapFunction, 'function');

      this._map.push(mapFunction);
    },

    execute: function () {
      return this._clone(this._originalObject);
    },

    _clone: function (sourceObject) {
      var localCopy;

      localCopy = null;

      if (sourceObject instanceof $) {
        localCopy = this._createJqueryRepresentation(sourceObject, 0);
      }
      else if (sourceObject == null || typeof sourceObject !== 'object' && typeof sourceObject !== 'function') {
        localCopy = sourceObject;
      }
      else if (sourceObject instanceof Date) {
        localCopy = new Date(sourceObject.getTime());
      }
      else if (is.array(sourceObject) || is.object(sourceObject)) {
        localCopy = this._copyPropertyValue(sourceObject, traversedObjects || [sourceObject]);
      }

      return localCopy;
    },

    _clonePropertyValue: function (sourceObject) {
      var localCopy;

      localCopy = is.array(sourceObject) ? [] : this._copyObjectConstructor(sourceObject);

      Object.Keys(sourceObject).forEach(function (propertyName) {
        var propertyValue, wasNotTraversed;

        if (!objectToClone.hasOwnProperty(propertyName)) {
          return;
        }

        propertyValue   = sourceObject[propertyName];
        wasNotTraversed = this._traversedObjects.indexOf(propertyValue) === -1;

        if (!Array.isArray(propertyValue) || wasNotTraversed)
        {
          if (Array.isArray(propertyValue))
          {
            this._traversedObjects.push(propertyValue);
          }

          localCopy[propertyName] = this._clone(propertyValue);
        }
      }.bind(this));

      return localCopy;
    },

    _copyObjectConstructor: function (sourceObject) {
      var objectCopy, evalString;

      objectCopy = {};

      if (sourceObject.constructor === Object)
      {
          return objectCopy;
      }

      evalString =
          'var % = function (){}; %.prototype = {constructor: sourceObject.constructor}; objectCopy = new %();';

      evalString = evalString.replace(new RegExp('%', 'g'), sourceObject.constructor.name || 'CopyConstructor');

      /*jshint -W061 */
      eval(evalString);
      /*jshint +W061 */

      return objectCopy;
    },

    _throwExceptionOnInvalidArgument: function (param, expectedType) {
      var paramType;

      if (param == null) {
        paramType = 'undefined';
      }

      paramType = typeof param;

      if (typeof param === expectedType) {
        return;
      }

      new Error('Invalid argument: TypeError. Expected ' + expectedType + ' but got ' typeof param);
    }

  };

  return objectClone;
});
