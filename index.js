'use strict';

/**
 * Model for interacting with the stuller ~REST API
 *
 */

var     xml2js  = require('xml2js')
    ,   request = require('request')
    ;

var StullerApi = function(opts) {

    opts = opts || {};

    // Get these from Stuller and pass them in in the opts object
    this.apiUrl = opts.apiUrl;
    this.token  = opts.token;
    
    this.requestUrl            = this.apiUrl;
    this.result                = null;
    this.rawResult             = null;

    // Allow request to be stubbed
    this.request = opts.request || request;

};

// These values should not be in a prototype as they will be shared... not so
// great.
StullerApi.prototype.update = function(opts) {

    opts = opts || {};

    for (var value in opts) {
        this[value] = opts[value];
    }

};

/**
 * Submit the request to Stuller
 *
 * @param {function} callback
 */
StullerApi.prototype.send = function(callback) {

    var that = this;
    if (!this.requestUrl) {
        throw new Error('missing requestUrl');
    }

    // Add the dev token if not already done
    if (!this.isDevTokenSet()) {
        this.addToken();
    }

    // Fire off the request to Stuller
    this.request(this.requestUrl, function(err, res, body) {
        if (err) {
            console.log(err);
            return callback && callback.call(that, err);
        }

        that.formatResult(body, callback);
    });

};

/**
 * Append the developer token to the requestUri
 *
 */
StullerApi.prototype.addToken = function(callback) {
    this.requestUrl += '&DeveloperToken=' + this.stullerDeveloperToken;
    return this;
};

/**
 * Test if the developer token has been set on the url
 */
StullerApi.prototype.isDevTokenSet = function() {
    return (/DeveloperToken/).test(this.requestUrl);
};

/**
 * Fetch Item Info by ItemNumber
 *
 * @param {string|array} numbers
 *
 * @return
 */
StullerApi.prototype.FetchItemInfo = function(numbers) {

    this.format = this.formatArrayOfItem;

    numbers = Array.isArray(numbers) ? numbers : [numbers];
    this.requestUrl += '/FetchItemInfo?';

    this.requestUrl += this.getQuery('ItemNumbers', numbers);

    return this;

};

/**
 * Fetch Item Info by ItemID
 *
 * @param {string|array} numbers
 *
 * @return
 */
StullerApi.prototype.FetchItemInfoByItemID = function(ids) {

    this.format = this.formatArrayOfItem;

    ids = Array.isArray(ids) ? ids : [ids];
    this.requestUrl += '/FetchItemInfoByItemID?';

    this.requestUrl += this.getQuery('ItemIDs', ids);

    return this;

};

/**
 * Fetch Item Info By Series
 *
 * @param {string|array} numbers
 *
 * @return
 */
StullerApi.prototype.FetchItemInfoBySeries = function(ids) {
    
    this.format = this.formatArrayOfItem;

    ids = Array.isArray(ids) ? ids : [ids];
    this.requestUrl += '/FetchItemInfoBySeries?';

    this.requestUrl += this.getQuery('SeriesNumbers', ids);

    return this;
};

/**
 * Fetch Item Price on Hand
 *
 * @param {string|array} numbers
 *
 * @return
 */
StullerApi.prototype.FetchItemPriceOnHand = function(numbers) {

    this.format = this.formatArrayItemPriceOnHand;

    numbers = Array.isArray(numbers) ? numbers : [numbers];
    this.requestUrl += '/FetchItemPriceOnHand?';

    this.requestUrl += this.getQuery('Items', numbers);

    return this;
};

/**
 * Fetch Item Price on Hand By ItemID
 *
 * @param {string|array} numbers
 *
 * @return
 */
StullerApi.prototype.FetchItemPriceOnHandByItemID = function(ids) {

    this.format = this.formatArrayItemPriceOnHand;

    ids = Array.isArray(ids) ? ids : [ids];
    this.requestUrl += '/FetchItemPriceOnHandByItemID?';

    this.requestUrl += this.getQuery('Items', ids);

    return this;
};

/**
 * Fetch Item Price on Hand by Series
 *
 * @param {string|array} numbers
 *
 * @return
 */
StullerApi.prototype.FetchItemPriceOnHandBySeries = function(ids) {
    
    this.format = this.formatArrayItemPriceOnHand;

    ids = Array.isArray(ids) ? ids : [ids];
    this.requestUrl += '/FetchItemPriceOnHandBySeries?';

    this.requestUrl += this.getQuery('Items', ids);

    return this;
};


/**
 * Fetch Items
 *
 * @return
 */
StullerApi.prototype.FetchItems = function() {

    this.format = this.formatArrayOfItemIdentifier;

    this.requestUrl += '/FetchItems?';

    return this;

};

/**
 * Fetch Ready To Wear Items
 *
 * @param Number type
 *
 * @return
 */
StullerApi.prototype.FetchRTWItems = function(type) {

    /**
     * 1 indicates that the return value will be item numbers.
     * 0 indicates that the return value will be item ids.
     */
    type = type || 0;

    this.format = this.formatArrayOfItemID;

    this.requestUrl += '/FetchRTWItems?';

    // We want it to return ItemIDs
    this.requestUrl += ('type=' + type);

    return this;

};

/**
 * Formats the query for the URL
 *
 * @param String indexName
 * @param Array numbers
 */
StullerApi.prototype.getQuery = function(indexName, numbers) {

    var query = [],
        i;

    for (i = 0; i < numbers.length; i++) {
        query.push(indexName + '=' + encodeURIComponent(numbers[i]));
    }

    return query.join('&');
};

/**
 * Use xml2js to format the result into a JSON object
 */
StullerApi.prototype.formatResult = function(xml, callback) {
    var that = this;

    var parser = new xml2js.Parser({
        explicitArray: false
    });

    parser.parseString(xml, function (err, result) {
        if (err) {
            console.log(err);
            return callback && callback.call(that, err);
        }
        that.rawResult = result;
        return callback && callback.call(that, null, that.format(result));
    });

};

/**
 * Formatter
 *
 * @param String data
 *
 * @return Array
 */
StullerApi.prototype.formatArrayOfItemID = function(data) {

    var results = [];

    var items = data.ArrayOfItemID.ItemID;

    for (var i = 0; i < items.length; i++) {
        results.push(items[i].$.ID);
    }

    return results;

};

/**
 * Formatter
 *
 * @param String data
 *
 * @return Array
 */
StullerApi.prototype.formatArrayOfItemIdentifier = function(data) {
    
    var results = [];

    var items = data.ArrayOfItemIdentifier.ItemIdentifier;

    for (var i = 0; i < items.length; i++) {

        var item = {};

        item.ItemNumber        = String(items[i].ItemNumber);
        item.ItemID            = Number(items[i].ItemID);

        results.push(item);

    }

    return results;

};

/**
 * Formatter
 *
 * @param String data
 *
 * @return Array
 */
StullerApi.prototype.formatArrayItemPriceOnHand = function(data) {

    var results = [];

    var items = data.ArrayOfItemPriceOnHand.ItemPriceOnHand;

    for (var i = 0; i < items.length; i++) {
        var item = {};
        
        item.ItemNumber        = String(items[i].ItemNumber);
        item.ItemID            = Number(items[i].ItemID);
        item.UnitPrice         = Number(items[i].UnitPrice);
        item.MSRP              = String(items[i].MSRP);
        item.QuantityAvailable = Number(items[i].QuantityAvailable);
        item.Status            = String(items[i].Status);
        item.DiscountPercent   = String(items[i].DiscountPercent);

        results.push(item);
    }

    return results;
};

/**
 * Formats the resulting XML into a usable JSON object
 *
 * @param String data
 *
 * @return Array
 */
StullerApi.prototype.formatArrayOfItem = function(data) {
    var results = [];

    var items = data.ArrayOfItem.Item;

    for (var i = 0; i < items.length; i++) {
        var item = {};

        item.ItemID            = Number(items[i].ItemID);
        item.ItemNumber        = String(items[i].ItemNumber);
        item.Series            = String(items[i].Series);
        item.Quality           = String(items[i].Quality);
        item.Size              = String(items[i].Size);
        item.Polish            = String(items[i].Polish);
        item.SeriesDescription = String(items[i].SeriesDescription);
        item.ShortDescription  = String(items[i].ShortDescription);
        item.Description       = String(items[i].Description);
        item.UnitPrice         = Number(items[i].UnitPrice);
        item.QuantityAvailable = Number(items[i].QuantityAvailable);
        item.Weight            = Number(items[i].Weight);
        item.SpecialOrder      = items[i].SpecialOrder == 'true';
        item.IsHIYW            = items[i].IsHIYW == 'true';
        item.IsSizable         = items[i].IsSizable == 'true';
        item.FingerSize        = Number(items[i].FingerSize);
        item.ExactSized        = items[i].ExactSized == 'true';
        item.LeadTime          = Number(items[i].LeadTime);
        item.Status            = String(items[i].Status);
        item.DiscoutPercent    = Number(items[i].DiscountPercent);
        item.Uom               = String(items[i].Uom);
        
        // Grab the images from array
        item.Images = [];
        
        var images = items[i].Images['ItemImage'] || [];

        for (var x = 0; x < images.length; x++) {
            var image = {};

            image.Type = String(images[x].Type);
            image.ImagePath = String(images[x].ImagePath);
            image.ThumbnailPath = String(images[x].ThumbnailPath);
            image.IsDefault = images[x].IsDefault == 'true';

            item.Images.push(image);
        }


        // Grab the stones from array
        item.SetWith = [];

        var stones = items[i].SetWith['StoneInfo'] || [];

        for (var s = 0; s < stones.length; s++) {
            var stone = {};

            stone.ItemNumber = String(images[s].ItemNumber);
            stone.Size = String(images[s].Size);
            stone.Quantity = Number(images[s].Quantity);
            stone.Description = String(images[s].Description);

            item.SetWith.push(stone);
        }
        
        results.push(item);
    }
    return results;
};


module.exports = StullerApi;
