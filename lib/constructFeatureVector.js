'use strict';
{
	var prop = require('./propertyToVector')
		, testOperations = require('./testOperations')
		, _ = require('lodash')
		, async = require('async')

	module.exports = function sparkify (source, operations, done) {
		let thisSource = {};
		Object.assign(thisSource, source)
		if (typeof thisSource !== 'object') {
			throw new TypeError('propertyToVector: "source" parameter should be an object, but found a/an ' + typeof source)
		}
		if (typeof operations !== 'object') {
			throw new TypeError('propertyToVector: "operations" parameter should be a map')
		}

		testOperations(operations) // throws error
		if (_.isEmpty(operations)) {
		  done(0)
		} else {

			async.map(operations, (op, callback) => {
				if (typeof op === 'string') {
					// a string is a path to a string property to enumerate
					let value = _.get(thisSource, op);
					prop.toVector(value, op, null, (result) => {
						callback(null, result)
					})
				} else {
					// if user provides a function, it will be passed thisSource - 
					// a local copy of source to prevent side effects - in the
					// first parameter, and it should have a callback in the second
					// parameter which returns a single numerical result value
					op(thisSource, (result) => {
						if (typeof result !== 'number') {
							throw new TypeError('result from user-provided function was not a number. result: ' + result)
						}
						callback(null, result)
					})
				}
			}, (err, results) => {
				done(results)
			})
		}
	}
}