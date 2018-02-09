/*
 * arr-sort <https://github.com/tywei90/arr-sort>
 *
 * Copyright (c) 2018-2020, tywei90.
 * Released under the MIT License.
 */

'use strict';

var arrDel = require('arr-del');

/*
 * Flatten javascript objects into a single-depth object
 * Object Flatten <https://gist.github.com/penguinboy/762197>
 */
function flattenObject(ob) {
	var toReturn = {};
	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;
		if ((typeof ob[i]) == 'object') {
			var flatObject = flattenObject(ob[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
}

// select matched value
function selData(arr, asc) {
	var sortFn;
	if(typeof asc === 'function'){
		sortFn = asc;
	}else{
		sortFn = function(a, b){
			if(asc === false){
				if(typeof a === 'string'){
					return b.localeCompare(a)
				}
				if(typeof a === 'number'){
					return b - a
				}
				return 0
			}else{
				if(typeof a === 'string'){
					return a.localeCompare(b)
				}
				if(typeof a === 'number'){
					return a - b
				}
				return 0
			}
		}
	}
	arr.sort(sortFn);
	return arr[0]
}

// select array whose attribute matches
function selObjArr(arr, attr, asc) {
	var optData;
	var tmpArr = [];
	var outArr = [];
	if(attr === undefined || arr.length === 0){
		return [];
	}
	if(typeof attr !== "string"){
		throw new TypeError('PARAM MUST BE STRING');
	}
	for(var i=0,len=arr.length; i<len; i++){
		tmpArr.push(flattenObject(arr[i])[attr]);
	}
	optData = selData(tmpArr, asc);
	for(var i=0,len=arr.length; i<len; i++){
		if (flattenObject(arr[i])[attr] === optData) {
			outArr.push(arr[i]);
		}
	}
	return outArr
}

/**
 * Delete array elements in one time by array consists of their indexes
 *
 * @param  {Array} `arr` The Array to sort.
 * @param  {Number Array} `indexArr` Array consists of indexes which you want to delete.
 * @return {Array} Returns a new deleted array.
 * @api public
 */
function arrSort(arr, sortLists) {
	if(sortLists === undefined){
		return arr;
	}
	if(Object.prototype.toString.call(sortLists) !== "[object Array]"){
		throw new TypeError('PARAM MUST BE ARRAY');
	}
	var i = 0;
	var len = sortLists.length;
	var inArr = JSON.parse(JSON.stringify(arr));
	var outArr = [];
	if (inArr.length === 0) {
		return [];
	}
	if(len === 0){
		return inArr;
	}
	// the right method to use arguments.callee in strict mode
	var sortArrOuter = (function sortArrWrap(arr, sortList) {
		if(Object.prototype.toString.call(sortList) !== "[object Object]"){
			throw new TypeError('PARAM MUST BE OBJECT ARRAY');
		}
		var filterArr = [];
		if (arr.length === 0) {
			return;
		}
		filterArr = selObjArr(arr, sortList.attr || '', sortList.asc);
		if(filterArr.length === 0){
			filterArr = arr;
		}
		if (filterArr.length === 1 || i >= len - 1) {
			outArr = outArr.concat(filterArr);
			// delete the corresponding original array element
			for(var k=0,len1=filterArr.length; k<len1; k++){
				// update stringifyInArr in case same elemets cause error deletion
				var stringifyInArr = [];
				for(var j=0,len2=inArr.length; j<len2; j++){
					stringifyInArr.push(JSON.stringify(inArr[j]));
				}
				var delIndex = stringifyInArr.indexOf(JSON.stringify(filterArr[k]));
				if (delIndex !== -1) {
					inArr = arrDel(inArr, [delIndex]);
				}
			}
		} else {
			i++;
			sortArrWrap(filterArr, sortLists[i])
		}
	})
	var loopSortArr = (function loopSortArrWrap() {
		i = 0;
		sortArrOuter(inArr, sortLists[0]);
		if (inArr.length === 0) {
			return
		}
		loopSortArrWrap();
	})
	loopSortArr();
	return outArr;
}

module.exports = arrSort