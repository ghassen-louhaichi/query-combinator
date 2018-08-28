var QueryGen = require('../src/QueryGen');

// setup and filters
var host = 'http://localhost:8080';
var colorCodingTypes = ['status'];
var colors = ['green', 'yellow', 'red'];
var startDates = ['2018-01-01'];
var endDates = ['2019-01-01'];
var promotions = ['123456'];
var products = ['654321'];

// query generation
QueryGen.query('Departments')
        .host(host)
        .url('/app/departments')
        .generate();

QueryGen.query('Classes')
        .host(host)
        .url('/clasees')
        .generate();

QueryGen.query('PromotionsByFilter')
        .host(host)
        .url('/promotions/by-filters')
        .alwaysFilter()
        .mixParam('department', ['123'])
        .mixParam('class', ['1234', '1235', '1236'])
        .generate();

QueryGen.query('PromotionsByFilter')
        .host(host)
        .url('/promotions/by-filters')
        .alwaysFilter()
        .mixParam('start', startDates)
        .mixParam('end', endDates)
        .generate();

QueryGen.query('PromotionsByFilter')
        .host(host)
        .url('/promotions/by-filters')
        .fixParam('promotion', promotions)
        .generate();

QueryGen.query('ProductsByFilter')
        .host(host)
        .url('/products/by-filters')
        .alwaysFilter()
        .mixParam('colorCodingType', colorCodingTypes)
        .mixParam('color', colors)
        .generate();

QueryGen.query('ProductsByFilter')
        .host(host)
        .url('/products/by-filters')
        .fixParam('product', products)
        .mixParam('promotion', promotions)
        .generate();
