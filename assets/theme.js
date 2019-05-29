window.slate = window.slate || {};
window.theme = window.theme || {};

/*================ Slate ================*/
/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {

  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element.first()
      .attr('tabIndex', '-1')
      .focus()
      .addClass(focusClass)
      .one('blur', callback);

    function callback() {
      $element.first()
        .removeClass(focusClass)
        .removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on('click', function(evt) {
      this.pageLinkFocus($(evt.currentTarget.hash));
    }.bind(this));
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.eventNamespace
      ? 'focusin.' + options.eventNamespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).on(eventName, function(evt) {
      if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/**
 * Cart Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Cart template.
 *
 * @namespace cart
 */

slate.cart = {

  /**
   * Browser cookies are required to use the cart. This function checks if
   * cookies are enabled in the browser.
   */
  cookiesEnabled: function() {
    var cookieEnabled = navigator.cookieEnabled;

    if (!cookieEnabled){
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
    }
    return cookieEnabled;
  }
};

/**
 * Utility helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions for dealing with arrays and objects
 *
 * @namespace utils
 */

slate.utils = {

  /**
   * Return an object from an array of objects that matches the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  findInstance: function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return array[i];
      }
    }
  },

  /**
   * Remove an object from an array of objects by matching the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  removeInstance: function(array, key, value) {
    var i = array.length;
    while(i--) {
      if (array[i][key] === value) {
        array.splice(i, 1);
        break;
      }
    }

    return array;
  },

  /**
   * _.compact from lodash
   * Remove empty/false items from array
   * Source: https://github.com/lodash/lodash/blob/master/compact.js
   *
   * @param {array} array
   */
  compact: function(array) {
    var index = -1;
    var length = array == null ? 0 : array.length;
    var resIndex = 0;
    var result = [];

    while (++index < length) {
      var value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  },

  /**
   * _.defaultTo from lodash
   * Checks `value` to determine whether a default value should be returned in
   * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
   * or `undefined`.
   * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
   *
   * @param {*} value - Value to check
   * @param {*} defaultValue - Default value
   * @returns {*} - Returns the resolved value
   */
  defaultTo: function(value, defaultValue) {
    return (value == null || value !== value) ? defaultValue : value
  }
};

/**
 * Rich Text Editor
 * -----------------------------------------------------------------------------
 * Wrap videos in div to force responsive layout.
 *
 * @namespace rte
 */

slate.rte = {

  wrapTable: function() {
    $('.rte table').wrap('<div class="rte__table-wrapper"></div>');
  },

  iframeReset: function() {
    var $iframeVideo = $('.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]');
    var $iframeReset = $iframeVideo.add('.rte iframe#admin_bar_iframe');

    $iframeVideo.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="rte__video-wrapper"></div>');
    });

    $iframeReset.each(function() {
      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

slate.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:section:reorder', this._onReorder.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

slate.Sections.prototype = $.extend({}, slate.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (typeof constructor === 'undefined') {
      return;
    }

    var instance = $.extend(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (!instance) {
      return;
    }

    if (typeof instance.onUnload === 'function') {
      instance.onUnload(evt);
    }

    this.instances = slate.utils.removeInstance(this.instances, 'id', evt.detail.sectionId);
  },

  _onSelect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onSelect === 'function') {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onDeselect === 'function') {
      instance.onDeselect(evt);
    }
  },

  _onReorder: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onReorder === 'function') {
      instance.onReorder(evt);
    }
  },

  _onBlockSelect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onBlockSelect === 'function') {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onBlockDeselect === 'function') {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(function(index, container) {
      this._createInstance(container, constructor);
    }.bind(this));
  }
});

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 */

slate.Currency = (function() {
  var moneyFormat = '${{amount}}';

  /**
   * Format money values based on your shop currency settings
   * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
   * or 3.00 dollars
   * @param  {String} format - shop money_format setting
   * @return {String} value - formatted value
   */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = slate.utils.defaultTo(precision, 2);
      thousands = slate.utils.defaultTo(thousands, ',');
      decimal = slate.utils.defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  };
})();

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

slate.Image = (function() {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    if(typeof src === "undefined") return null;
    var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

    if (match) {
      return match[1];
    } else {
      return null;
    }
  }

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    } else {
      return null;
    }
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist. Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
  }

  Variants.prototype = $.extend({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = $.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = slate.utils.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;
      var found = false;

      variants.forEach(function(variant) {
        var satisfied = true;
        var options = variant.options;

        selectedValues.forEach(function(option) {
          if (satisfied) {
            satisfied = (option.value === variant[option.index]);
          }
        });

        if (satisfied) {
          found = variant;
        }
      });

      return found || null;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
        return;
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container)[0].value = variant.id;
    }
  });

  return Variants;
})();


/*================ Theme Globals ================*/
/* Global functions var site-wide functionality */
Shopify.queryParams = {};
if (location.search.length) {
  for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
    aKeyValue = aCouples[i].split('=');
    if (aKeyValue.length > 1) {
      Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
    }
  }
}

$(function() {

  //hide admin bar if setting is set for that and it exists
  if(!window.theme.shopSettings["admin_bar"] && $("#admin_bar_iframe").length > 0)
  {
    $("#admin_bar_iframe").remove();
    $("html").css("padding-top",0);
  }

  //handle auto focusing on inputs (this way is better for some mobile devices)
  window.setTimeout(function() {$("input[data-autofocus]").focus();},500);

  //remove any initial hiding of content to remove screen flickers
  $(".dom-style-remove").attr('style','');

  //toggle search bar in header
  $('.search')
    .bind('click', function(event) {
      $(".search-field").toggleClass("expand-search");
      $(".search-field").focus();
    });

});
$(function() {

    /* Cart Toggling */
    $("body").on('click', '.cart-toggle', function(e) {
        global_CartToggle(e);
    });

    /* Cart Line Item Click Events */
    $("body").on('click', '.cart-item-remove', function(e) {
        e.preventDefault();

        //if this is part of a normal cart display, piggyback on input number changing
        if($(this).closest('.cart-display-item').find(".input-number").length > 0)
        {
            $(this).closest('.cart-display-item').find(".input-number").first().val(0);
            global_CartLineQuantity($(this).closest('.cart-display-item').find(".input-number").first());
        }
        else
            global_RemoveLineFromCart($(this).data('line'));
    });

    $("body").on('click', '#cart-display .input-number-decrement-cart', function(e) {
        var $quantity_elem = $(this).parents('.input-number-group').find('.input-number');
        input_number_change($quantity_elem, -1);
    });

    $("body").on('click', '#cart-display .input-number-increment-cart', function(e) {
        var $quantity_elem = $(this).parents('.input-number-group').find('.input-number');
        input_number_change($quantity_elem, 1);
    });

    $("body").on('change', '#cart-display .input-number', function(e) {
        var $quantity_elem = $(this);
        global_CartLineQuantity($quantity_elem);
    });

    $("body").on('click', '#cart-display .cart-form-update', function(e) {
        e.preventDefault();
        global_UpdateCartForm($(this).closest("form"));
    });

    $("body").on('click', '[data-add2cart]', function(e) {
        e.preventDefault();
        global_AddToCartFromForm($(this).closest('[data-add2cart-container]'));
    });

    /* Gift Wrapping Checkbox Functionality */
    $("body").on('change', '#cart-display #gift-wrapping', function(e) {
        e.preventDefault();
        if($(this).is(':checked')) {
            global_AddGiftWrap();
        } else {
            global_RemoveGiftWrap();
        }
    });

});

/*
    Global functions var site-wide add to cart functionality
*/
function global_CartToggle(handler, location)
{
    if(window.theme.shopSettings["cart_type"] == "drawer" ||
        (window.theme.shopSettings["mobile_display"] && window.theme.shopSettings["cart_type"] == "drawer_mobile") ||
        (!window.theme.shopSettings["mobile_display"] && window.theme.shopSettings["cart_type"] == "drawer_desktop")
    )
    {
        if(typeof handler != "undefined" && handler != null) handler.preventDefault();
        $(".cart-ribbon").hide();
        $('#product-quick-view').foundation("close");
        global_CartDrawerAdjust();
        $("#cart-drawer").foundation("toggle");
    }
    else if (typeof location != "undefined")
    {
        if(typeof handler != "undefined") handler.preventDefault();
        document.location = location;
        return false;
    }
}

//function to modify some classes and things when the cart is toggled
function global_CartDrawerAdjust()
{
    $("#cart-drawer .cart-row-change-columns").each(function() {
        $(this).addClass($(this).attr('data-change-to')).removeClass($(this).attr('data-change'));
    });
}

function global_AddToCart(id, qty, props, callback)
{
    //reset dtstamp property if found
    if(Object.keys(props).length > 0 && (typeof props["_dtstamp"] !== "undefined"))
        props["_dtstamp"] = Date.now();

    $.ajax({
      	type: "POST",
      	dataType: "json",
      	url: '/cart/add.js',
      	data:
      	{
            quantity: qty,
            id: id,
            properties: props
      	},
      	success: (typeof callback != "undefined") ? callback : global_ItemAddedToCart,
      	error: global_AddToCartError
    });
}

function global_AddToCartFromForm(form, callback)
{
    //reset dtstamp property if found
    if($(form).find(".prop-dtstamp").length > 0 && !$(form).find(".prop-dtstamp").prop('disabled'))
        $(form).find(".prop-dtstamp").val(Date.now());

    //special logic here that if we are not in a form, to serialize the inputs in a different way
    var form_data = ($(form).prop("tagName") != "FORM") ? $(form).find("select, textarea, input").serialize() : $(form).serialize();

    $.ajax({
      	type: "POST",
      	dataType: "json",
      	url: '/cart/add.js',
      	data: form_data,
      	success: (typeof callback != "undefined") ? callback : global_ItemAddedToCart,
      	error: global_AddToCartError
    });
}

function global_ItemAddedToCart(item)
{
    $(".cart-ribbon .cart-ribbon-text").hide();
    $(".cart-ribbon .added-variant-title").last().text(item.title).closest(".cart-ribbon-text").show();
    $(".cart-ribbon").last().slideDown().delay(window.theme.shopSettings.cart_ribbon_delay).slideUp();
    global_UpdateCart(null);
}

function global_AddToCartError(xhr, status, error)
{
    if(typeof xhr.status !== "undefined" && xhr.status == 422)
        swal("Sorry...", "You are trying to purchase more than is currently available. Please decrease the quantity and try again.", "error");
    else
        swal("Sorry...", "We experienced an issue while adding this item to the cart. Please try again.", "error");

    //enable button and set its text
    var $btn = $(".cart-loading");
    if($btn.length > 0)
    {
        $btn.removeAttr('disabled','disabled').removeClass('cart-loading').prop('disabled',false);
        if($btn.attr('data-ready-text')) $btn.html($btn.attr('data-ready-text'));
    }
}

function global_CartLineQuantity(elem)
{
    $(elem).closest('.input-number-group').addClass('active');
    var new_quantity = parseInt($(elem).val()),
    this_line = $(elem).closest(".cart-display-item").data('line'),
    grouping_prop = $(elem).closest(".cart-display-item").data('property'),
    grouping_prop_val = $(elem).closest(".cart-display-item").data('propertyValue');

    var quantity_changed = function(cart)
    {
        if(new_quantity > 0 && new_quantity > cart.items[this_line-1].quantity)
        {
            swal("Sorry...", "You are trying to purchase more than is currently available.", "error");
            return global_UpdateCart(cart);
        }

        global_CartLineUpdated(cart);
    };

    //setup function to update a cart line's quantity
    var cartLineQuantity = function(line, quantity, run_async, run_changed)
    {
        var last_cart;

        $.ajax({
          	type: "POST",
          	dataType: "json",
          	url: '/cart/change.js',
          	async: run_async,
          	data:
          	{
                quantity: new_quantity,
                line: this_line
          	},
          	success: (run_changed) ? quantity_changed : function(cart){last_cart = cart},
          	error: global_AddToCartError
        });

        return last_cart;
    };

    //if we have a grouping
    if(jQuery.trim(grouping_prop_val) != "")
    {
        var cartLineQuantityByProperty = function(prop, prop_val, quantity)
        {
            $.ajax({
              	type: "GET",
              	url: '/cart.js',
              	dataType: 'json',
              	success: function(cart)
              	{
              	    var line = 1,this_item,updated_cart;
              	    for(var ci in cart.items)
              	    {
              	        this_item = cart.items[ci];
              	        //if this item's property matches the property involved, set the quantity
              	        if(Object.keys(this_item.properties).length > 0 && (typeof this_item.properties[grouping_prop] !== "undefined") && this_item.properties[grouping_prop] == grouping_prop_val)
              	        {
              	            updated_cart = cartLineQuantity(this_line, new_quantity, false, false);
              	            if(new_quantity > 0 && new_quantity > updated_cart.items[this_line-1].quantity)
                            {
                                swal("Sorry...", "You are trying to purchase more than is currently available.", "error");
                                return global_UpdateCart(updated_cart);
                            }
              	        }

              	        if(quantity > 0) line++;
              	    }
              	    global_CartLineUpdated(updated_cart);
              	},
              	error: global_CartAjaxError
            });
        };

        //execute the quantity changes for all items with a matching group value
        cartLineQuantityByProperty(grouping_prop, grouping_prop_val, new_quantity);
    }
    //execute the single line quantity change
    else
        cartLineQuantity(this_line, new_quantity, true, true);
}

function global_RemoveLineFromCart(line, callback)
{
    $.ajax({
      	type: "POST",
      	dataType: "json",
      	url: '/cart/change.js',
      	data:
      	{
            quantity: 0,
            line: line
      	},
      	success: (typeof callback != "undefined") ? callback : global_CartLineUpdated,
      	error: global_AddToCartError
    });
}

function global_CartLineUpdated(cart)
{
    $("#cart-display-status").last().slideDown("fast").delay(window.theme.shopSettings.cart_ribbon_delay/4).slideUp("fast");
    global_UpdateCart(cart);
}

function global_CartAjaxError(resp)
{
    $(".input-number-group.active").removeClass('active');
    swal("Sorry...", "We experienced an issue while trying to complete that request. Please try again.", "error");
}

function global_CartDisplay(cart)
{
    $(".input-number-group.active").removeClass('active');
    $(".CartCount").text(cart.item_count);
    $(".cart-content#cart-drawer-content").load("/cart?view=drawer", function () {
        global_CartDrawerAdjust();
        init_price_display($(".cart-content#cart-drawer-content"));
        if(localStorage.getItem('gift-wrapping') == 'checked') {
            $('#gift-wrapping').prop('checked', true);
        } else {
            $('#gift-wrapping').prop('checked', false);
        }
    });
    $(".cart-content#cart-template-content").load("/cart?view=desktop", function() {
        init_price_display($(".cart-content#cart-template-content"));
    });
}

function global_UpdateCart(cart)
{
    if(!cart)
    {
        $.ajax({
          	type: "GET",
          	url: '/cart.js',
          	dataType: 'json',
          	success: global_CartDisplay,
          	error: global_CartAjaxError
        });
    }
    else
        global_CartDisplay(cart);
}

function global_UpdateCartForm(form)
{
    window.scrollTo(0,0);
    $.ajax({
      	type: "GET",
      	url: '/cart/update.js',
      	data: $(form).serialize(),
      	dataType: 'json',
      	success: function(cart)
      	{
      	    $("#cart-display-status").last().slideDown("fast").delay(window.theme.shopSettings.cart_ribbon_delay/4).slideUp("fast");
      	    global_CartDisplay(cart);
      	},
      	error: global_CartAjaxError
    });
}

function global_AddGiftWrap() {
    $.ajax({
      	type: "POST",
      	dataType: "json",
      	url: '/cart/add.js',
      	data:
      	{
            quantity: 1,
            id: 6633821571
      	},
      	success: (typeof callback != "undefined") ? callback : global_CartDisplay,
      	error: global_AddToCartError
    });

    localStorage.setItem('gift-wrapping', 'checked');
}

function global_RemoveGiftWrap() {
  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: '/cart/change.js',
    data:
    {
        quantity: 0,
        id: 6633821571
    },
    success: (typeof callback != "undefined") ? callback : global_CartLineUpdated,
    error: global_AddToCartError
  });

  localStorage.setItem('gift-wrapping', 'notchecked');
}

/* Global functions var site-wide product quick views */
$(document).ready(function () {

  $(document).on(
    'open.zf.reveal', '#product-quick-view[data-reveal]', function (event) {
      var sections = new slate.Sections();
      sections.register('product', theme.Product);
    }
  );

  $("body").on("click", ".product-quick-view", function(event) {
    event.preventDefault();
    var elem = $(this);

    var $qv = $('#product-quick-view');
    var qv_url = '/products/' + $(elem).data('handle') + "?quickview=1&view=quick";
    if( (typeof $(elem).data('variant') !== "undefined") && $(elem).data('variant') != "")
      qv_url += "&variant_id=" + $(elem).data('variant');

    $(".qv-product","#product-quick-view").load(qv_url, function(resp) {
        $qv.foundation('open');
        init_price_display($(".qv-product","#product-quick-view"));
    });

  });

});
/* Site-wide handler for evaluating customer tags and theme rules for customizing price display */

var PRICE_RULES = null;
$(function() {
  init_price_display($("body"));
});

function init_price_display(container)
{
  if($(".price-display", container).length > 0)
  {
    //display price with currency and thousands separator
    var price_pretty = function(price)
    {
      return "$" + (price/100).toFixed(2).toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    //primary function here to evaluate all of our customer/pricing rules
    var price_evaluate = function(price, product_id)
    {
      var price_orig = price;
      product_id = (typeof product_id === "undefined") ? 0 : product_id;

      /* Example pricing rules:
        - potentially a global tag specific rule in theme settings
        - customer specific pricing tags (overrides global)
      */

      for(rulei in PRICE_RULES.rules)
      {
        var rule = PRICE_RULES.rules[rulei];

        //immediately process customer tags since they were already evaluated at the server level (/?view=pricing_rules)
        if(rule.type == "customer" || rule.type == "global")
        {
          if(rule.percentage > 0) price = price * ((100-rule.percentage)/100);
          if(rule.dollars > 0) price = price - (100*rule.dollars);
        }

      }

      //last minute check for negative value
      if(price < 0) price = 0;

      //TODO: based on line item property that we append, Shopify Script needs to do its thing and decrement price to the specified value

      //if we have a product ID here, and a reduced price, AND a line item property field, let's set it to the new price
      if(product_id > 0 && $(".pr-property-" + product_id).length > 0)
        $(".pr-property-" + product_id).val(price).prop('disabled', !(price < price_orig));


      return price;
    };

    //function to iterate the price elements in the HTML
    var iterate_price_display = function(settings) {

      //loop through all pricing on page and pass each price through our rules and display functions
      $(".price-display:not(.price-altered)", container).each(function() {

        //retrieve this element's price
        var price_check = parseFloat($(this).text().replace('$','').replace(',',''));
        if(!price_check) return true;

        //convert to pennies
        var this_price = price_check*100;

        //retrieve the product involved here
        var this_product = $(this).attr('data-product-id');
        if(typeof this_product === "undefined")
          this_product = $(this).closest('[data-product-id]').attr('data-product-id');

        //evaluate and return new price
        var new_price = price_evaluate(this_price, this_product);

        //if we have a new price, do something
        if(new_price != this_price)
        {
          if(settings.display_type == "strikethrough")
          {
            //remove prepended prices from pricing rules
            $(".price-display-full", $(this).parent()).remove();

            var $strikethrough = $("<s>",{"class": "price-display-full"}).append($("<div>", {text: price_pretty(this_price)}));
            $(this).parent().prepend($strikethrough);
          }

          $(this).text(price_pretty(new_price)).addClass('price-altered');
        }
      });

    };

    //function to retrieve the pricing rules
    var price_rules_retrieve = function () {

      if(PRICE_RULES !== null) return iterate_price_display(PRICE_RULES.settings);

      //alert('FETCHING PRICE RULES');

      $.ajax({
        type: "GET",
        url: "/?view=pricing_rules",
        success: function(resp)
        {
          PRICE_RULES =JSON.parse(resp);
          iterate_price_display(PRICE_RULES.settings);
        }
      });
    };

    //ok, we are ready, go get em!
    price_rules_retrieve();

  }
}

/*================ Sections ================*/
/**
 * Collection Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection templates.
 *
   * @namespace collection
 */
 /* global $ */
 /* global theme */
 /* global slate */

theme.Collection = (function() {

  var selectors = {
    sortBy: '[data-sort-by]',
    sortByDefault: '[data-sort-by-default]',
    swatchContainer: '[data-collection-swatches]'
  };

  /**
   * Collection section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Collection(container) {
    this.$container = $(container);
    var sectionId = this.$container.attr('data-section-id');

    this.settings = {};
    this.namespace = '.collection';
    this.init_sort_by();
    this.paging_lookahead_page = 1;
    //this.paging_lookahead();
    this.init_collection_swatches();
  }

  Collection.prototype = $.extend({}, Collection.prototype, {

    /**
     * Setup sort by select and the change callback
     */
    init_sort_by: function() {

      $(selectors.sortBy, this.$container)
       .val($(selectors.sortByDefault, this.$container).val())
       .bind('change', function() {
         Shopify.queryParams.sort_by = jQuery(this).val();
         location.search = jQuery.param(Shopify.queryParams);
       });
    },

    /**
     * Collection swatches
     */
    init_collection_swatches: function() {

      if($(selectors.swatchContainer, this.$container).length > 0)
      {

        $('body').on('click', '.swatch span', function() {

          var optionIndex = $(this).closest('.swatch').attr('data-option-index');
          var optionValue = $(this).closest('.swatch').attr('data-value');

          /* Update Images */
          if($(this).data("image").indexOf("no-image") == -1) {
            $(this).parents('.product-grid-item').find('.prod-img img:first-child').attr('src', $(this).data("image"));
          }
          if($(this).data("secimg").indexOf("no-image") == -1) {
            $(this).parents('.product-grid-item').find('.prod-img .sec-img').attr('src', $(this).data("secimg"));
          }

          /* Update Image Link */
          $(this).parents('.product-grid-item').find('.prod-img').attr('href', $(this).closest('.swatch').data("variant-link"));

          /* Update Active State */
          $(this).parents('.collection_swatches').find('.active').removeClass('active');
          $(this).closest('.swatch').addClass('active');

          var active_swatch_values = [];
          $(this).closest('.product-grid-item').find(".swatch.active").each(function() {
            active_swatch_values.push($(this).data('value'));
          });

          /* Update the select dropdown with chosen swatch for add to cart functionality */
          var optionId = $(this)
            .closest('.product-grid-item-form')
            .find('[data-option-selector] option[data-option1="' + active_swatch_values[0] + '"][data-option2="' + active_swatch_values[1] + '"]').val();

          if(optionId != undefined) {
            $(this)
            .closest('.product-grid-item-form')
            .find('[data-option-selector]')
            .val(optionId)
            .trigger('change');

            $(this)
            .closest('.product-grid-item-form')
            .find('[data-add2cart]')
            .text('Add to Cart')
            .attr('disabled', false);

          } else {

            $(this)
            .closest('.product-grid-item-form')
            .find('[data-add2cart]')
            .text('Sold Out')
            .attr('disabled', true);
          }

        });
      }
    },

    /* Function to inspect next page's content */
    paging_lookahead_chk: function() {

        var self = this;

        $.ajax({
        	type: "GET",
        	url: document.location.pathname,
        	data:
        	{
              page: ++this.paging_lookahead_page
        	},
        	success: function(resp)
        	{

        	  //endless loop prevention
        	  if(self.paging_lookahead_page == 50)
        	    return self.paging_adjust(self.paging_lookahead_page-1);

        	  if(resp.indexOf("product-grid-item") >= 0)
        	    self.paging_lookahead();
        	  else
        	    self.paging_adjust(self.paging_lookahead_page-1);
        	}
      });
    },

    /* Function to click ahead to next page to see if products will be displayed */
    paging_lookahead: function() {
        this.paging_lookahead_chk();
    },

    /* Function to rewrite/show/hide paging based on lookaheads */
    paging_adjust: function(max_page)
    {
      if(max_page > 1 || (parseInt($("#paging-current").val()) > 1))
      {
        $(".paginate-control").removeClass('hide');

        //first handle "next"
        if(parseInt($("#paging-next").val()) > max_page)
          $(".pagination .next").addClass('hide');

        //now handle the individual pages
        $(".pagination .page a").each(function() {
          if(parseInt($(this).text()) > max_page)
            $(this).remove();
        });
      }
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    }

  });

  return Collection;
})();

/**
 * FeaturedCollection Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts for the Featured Collection section
 *
   * @namespace featured-collection
 */
 /* global $ */
 /* global theme */
 /* global slate */

theme.FeaturedCollection = (function() {

  /**
   * Dyno section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function FeaturedCollection(container) {
    this.$container = $(container);
    var sectionId = this.$container.attr('data-section-id');

    this.settings = {};
    this.namespace = '.featured-collection';
    this.init_sliders();
  }

  FeaturedCollection.prototype = $.extend({}, FeaturedCollection.prototype, {

    /**
     * Run through section and initialize any sliders with properties based on data attributes
     */
    init_sliders: function() {
      this.$container.find(".dyno-slider").each(function() {
        $(this).slick({
          arrows: $(this).data("sliderArrows"),
          dots: $(this).data("sliderDots"),
          infinite: $(this).data("sliderInfinite"),
          slidesToShow: $(this).data("sliderSlidesToShow"),
          slidesToScroll: $(this).data("sliderSlidesToScroll"),
          autoplay: $(this).data("sliderAutoplay"),
          autoplaySpeed: 1000*parseInt($(this).data("sliderAutoplaySecs")),
          responsive: [
            {
              breakpoint: window.theme.shopSettings["mobile_width_max"],
              settings: {
                slidesToShow: $(this).data("sliderSlidesToShowSmall"),
                slidesToScroll: $(this).data("sliderSlidesToShowSmall")
              }
            },
            {
              breakpoint: window.theme.shopSettings["tablet_width_max"],
              settings: {
                slidesToShow: $(this).data("sliderSlidesToShowMedium"),
                slidesToScroll: $(this).data("sliderSlidesToShowMedium")
              }
            }
          ]
        });

      });
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    }
  });

  return FeaturedCollection;
})();

/**
* Product Template Script
* ------------------------------------------------------------------------------
* A file that contains scripts highly couple code to the Product template.
*
  * @namespace product
*/
/* global $ */
/* global theme */
/* global slate */
/* global global_ItemAddedToCart */
/* global global_AddToCartError */

theme.Product = (function() {

  var selectors = {
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    comparePrice: '[data-compare-price]',
    comparePriceText: '[data-compare-text]',
    originalSelectorId: '[data-product-select]',
    priceWrapper: '[data-price-wrapper]',
    productFeaturedImage: '[data-product-featured-image]',
    productImageZoom: '[data-product-image-zoom]',
    productImageSlider: '[data-product-image-slider]',
    productForm: '[data-product-form]',
    productJson: '[data-product-json]',
    sectionSettingsJson: '[data-section-json]',
    productPrice: '[data-product-price]',
    productThumbs: '[data-product-single-thumbnail]',
    productSliderThumbs: '[data-product-slider-thumbnail]',
    singleOptionSelector: '[data-single-option-selector]',
    relatedProducts: '[data-related-products]',
    relatedProductsInternal: '.related-products',
    relatedProductsPick: '[data-rp-pick]',
    productGridItem: ".product-grid-item",
    zoomMobile: 'data-image-zoom-mobile',
    zoomTrigger: '[data-image-zoom-trigger]',
    zoomMagnification: '[data-image-zoom-percentage]',
    variantCurrent: '[data-variant-id]',
    swatchContainer: '[data-swatches]',
    outStockNotify: '[data-out-of-stock-notify]'
  };

  /**
  * Product section constructor. Runs on page load as well as Theme Editor
  * `section:load` events.
  * @param {string} container - selector for the section container DOM element
  */
  function Product(container) {
    this.$container = $(container);
    var sectionId = this.$container.attr('data-section-id');

    this.settings = {};
    this.namespace = '.product';

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$(selectors.productJson, this.$container).html()) {
      return;
    }

    this.productSingleObject = JSON.parse($(selectors.productJson, this.$container).html());
    this.sectionSettings = JSON.parse($(selectors.sectionSettingsJson, this.$container).html());
    this.settings.imageSize = slate.Image.imageSize($(selectors.productFeaturedImage, this.$container).attr('src'));

    slate.Image.preload(this.productSingleObject.images, this.settings.imageSize);

    this.initVariants();
    this.initImages();
    this.init_slider();
    this.initAddToCart();
    this.initRelatedProducts();
    this.initSwatches();
    this.resetZoom();
  }

  Product.prototype = $.extend({}, Product.prototype, {

    /**
    * Handles the application of product image zoom if enabled
    */
    resetZoom: function() {

      //don't show on mobile if setting is set that way
      if($(selectors.productImageZoom, this.$container).attr(selectors.zoomMobile) == "false" && $(window).width() <= window.theme.shopSettings["mobile_width_max"])
        return false;

      var trigger = $(".image-zoom")[0].dataset.imageZoomTrigger;
      var magnify = $(".image-zoom")[0].dataset.imageZoomPercentage;

      if($(selectors.productImageZoom, this.$container).length > 0)
      {
        $(selectors.productImageZoom, this.$container).trigger('zoom.destroy');
        $(selectors.productImageZoom, this.$container).zoom({ on: trigger, magnify: magnify, onZoomIn: function(){ this.style.cursor = "zoom-in" }});
      }

    },

    /**
    * Handles the removal of any pre-existing zooms
    */
    removeZoom: function() {

      if($(selectors.productImageZoom, this.$container).length > 0)
        $(selectors.productImageZoom, this.$container).trigger('zoom.destroy');

    },

    /**
    * Handles change events for product images
    */
    initImages: function() {
      this.$container.on('click', selectors.productThumbs, this.productImageThumbSelect.bind(this));
      this.$container.on('click', selectors.productSliderThumbs, this.productSliderThumbSelect.bind(this));
    },

    /**
     * Run through section and initialize any sliders with properties based on data attributes
     */
    init_slider: function() {
      var $elem = $(selectors.productImageSlider, this.$container);
      if($elem.length > 0)
      {
        $elem.slick({
          arrows: $elem.data("sliderArrows"),
          dots: $elem.data("sliderDots"),
          infinite: $elem.data("sliderInfinite"),
          slide: ".product-image-slide",
          slidesToShow: $elem.data("sliderSlidesToShow"),
          slidesToScroll: $elem.data("sliderSlidesToScroll"),
          autoplay: $elem.data("sliderAutoplay"),
          autoplaySpeed: 1000*parseInt($elem.data("sliderAutoplaySecs")),
          responsive: [
            {
              breakpoint: window.theme.shopSettings["mobile_width_max"],
              settings: {
                slidesToShow: $elem.data("sliderSlidesToShowSmall"),
                slidesToScroll: $elem.data("sliderSlidesToShowSmall")
              }
            },
            {
              breakpoint: window.theme.shopSettings["tablet_width_max"],
              settings: {
                slidesToShow: $elem.data("sliderSlidesToShowMedium"),
                slidesToScroll: $elem.data("sliderSlidesToShowMedium")
              }
            }
          ]
        });

        this.updateSliderVariant();
      }
    },

    /**
     * Run through section and re-initialize any
     */
    reinit_slider: function() {
      var $elem = $(selectors.productImageSlider + ".slick-initialized", this.$container);
      if($elem.length > 0)
      {
        $elem.slick('unslick');
        this.init_slider();
      }
    },

    /* function to only show images that are related to a variant either by ID or through its alt tags*/
    variantImageGallery: function(variant) {

      //make sure section setting is enabled
      if(!variant || !this.sectionSettings.variant_images) return false;

      /* Check Slider Images */
      $(".product-image-instance", this.$container).each(function () {

        //check for explicit variant image
        if($(this).data('imageVariants').toString().indexOf(variant.id) >= 0)
          $(this).removeClass('product-image-slide-ignore').addClass('product-image-slide');
        else
          $(this).addClass('product-image-slide-ignore').removeClass('product-image-slide');

        //check for special alt tag to match variant option values
        if($(this).data('imageVariants') == "0")
        {
          if($(this).data('imageAlt') == variant.option1 || $(this).data('imageAlt') == variant.option2 || $(this).data('imageAlt') == variant.option3)
            $(this).removeClass('product-image-slide-ignore').addClass('product-image-slide');
          else
            $(this).addClass('product-image-slide-ignore').removeClass('product-image-slide');
        }
      });

      /* Check Thumbnails */
      $(".image-thumb-gallery", this.$container).each(function () {

        //first hide all of them
        $(this).find("li").hide().removeClass("active");

        //now loop through them and match against variant
        $(this).find("li").each(function() {

          //check for explicit variant image
          if($(this).data('imageVariants').toString().indexOf(variant.id) >= 0)
            $(this).show().addClass("active");

          //check for special alt tag to match variant option values
          if($(this).data('imageVariants') == "0")
          {
            if($(this).data('imageAlt') == variant.option1 || $(this).data('imageAlt') == variant.option2 || $(this).data('imageAlt') == variant.option3)
              $(this).show().addClass("active");
          }

        });

        //hide thumbnails if there is only one available
        if($(this).find("li.active").length <= 1)
          $(this).hide();
        else
          $(this).show();
      });

      this.reinit_slider();

    },

    /**
    * Apply ajax cart adding methods if needed
    */
    initAddToCart: function() {
      if(typeof $(selectors.addToCart, this.$container).data('ajax') != "undefined")
        this.$container.on('click', selectors.addToCart, this.addToCart.bind(this));
    },

    /**
    * Handles change events from the variant inputs
    */
    initVariants: function() {
      var options = {
        $container: this.$container,
        enableHistoryState: this.$container.data('enable-history-state') || false,
        singleOptionSelector: selectors.singleOptionSelector,
        originalSelectorId: selectors.originalSelectorId,
        product: this.productSingleObject
      };

      this.variants = new slate.Variants(options);

      this.$container.on('variantChange' + this.namespace, this.updateAddToCartState.bind(this));
      this.$container.on('variantImageChange' + this.namespace, this.updateProductImage.bind(this));
      this.$container.on('variantPriceChange' + this.namespace, this.updateProductPrices.bind(this));

      /* If variant image gallery is enabled, start out display by only showing this variant's images */
      for(var vi in this.productSingleObject.variants) {
        if(this.productSingleObject.variants[vi].id == $(selectors.originalSelectorId, this.$container).val()) {
          this.variantImageGallery(this.productSingleObject.variants[vi]);
        }
      }
    },

    /**
    * Handles any script related to the display of swatches for a product
    */
    initSwatches: function() {

      if($(selectors.swatchContainer, this.$container).length > 0)
      {

        $('body').on('change', '.swatch :radio', function() {
          var optionIndex = $(this).closest('.swatch').attr('data-option-index');
          var variantInfo = $(this).attr('data-variant-info');
          var optionValue = $(this).val();

          $(this)
            .closest('form')
            .find('[data-single-option-selector]')
            .eq(optionIndex)
            .val(optionValue)
            .trigger('change');

            $(this).closest('.swatch').find('.opt-name').text(optionValue);
            $('.variant-info').hide();
            $('.' + variantInfo).show();

        });

      }
    },

    /**
    * Handles any script related method for a product's related products section
    */
    initRelatedProducts: function() {

      if($(selectors.relatedProducts, this.$container).length > 0)
      {
        var rpData = $(selectors.relatedProducts, this.$container).data(),
        rpKeys = Object.keys(rpData),method = rpData[rpKeys[0]];

        //do different things based on related produts method
        if(method == "tag-handle")
        {
          var self = this;
          $(selectors.relatedProductsInternal).load("/collections/all/related-" + this.productSingleObject.handle + "?view=grid_items", function ()
          {
            self.renderRelatedProducts();
          });
        }
        else if(method == "tag-shared")
        {
          var self = this;
          for(tagi in this.productSingleObject.tags)
          {
            if(this.productSingleObject.tags[tagi].indexOf("related-") == 0)
            {
              $(selectors.relatedProductsInternal).load("/collections/all/" + this.productSingleObject.tags[tagi] + "?view=grid_items", function ()
              {
                self.renderRelatedProducts();
              });
              break;
            }
          }
        }
        else
          this.renderRelatedProducts();

      }
    },

    /* Related Products handling is done now display them if any are there */
    renderRelatedProducts: function() {

      if($(selectors.productGridItem, selectors.relatedProducts).length > 0)
      {
        //make sure current product is not in set of related products
        $(selectors.productGridItem + "[data-handle='" + this.productSingleObject.handle + "']", selectors.relatedProducts).remove();

        //randomly pick some of them for display?
        if($(selectors.relatedProductsPick, selectors.relatedProducts).length > 0)
          $(selectors.relatedProductsInternal + " > " + selectors.productGridItem).pick($(selectors.relatedProductsInternal, selectors.relatedProducts).data("pick"));

        //done, now display it if will still have grid items after adjustments
        if($(selectors.productGridItem, selectors.relatedProducts).length > 0)
          $(selectors.relatedProducts, this.$container).show();
      }

    },

    /**
    * Event callback to handle the adding an item to the cart via ajax
    */
    addToCart: function(evt) {
      evt.preventDefault();
      var $btn = $(evt.currentTarget);

      //disable button and set its loading text
      $btn.attr('disabled','disabled').addClass('cart-loading').prop('disabled',true).attr('data-ready-text', $btn.html());
      if($btn.attr('data-loading-text')) $btn.html($btn.attr('data-loading-text'));

      //submit form data to cart
      global_AddToCartFromForm($(selectors.productForm, this.$container), this.itemAddedToCart);
    },

    /**
    * Event callback after an item has been successfully added to the cart
    */
      itemAddedToCart: function(item) {

        $(selectors.addToCart, this.$container).removeAttr('disabled').prop('disabled',false).removeClass("cart-loading").html($(selectors.addToCart, this.$container).attr('data-ready-text'));
        global_ItemAddedToCart(item);
    },

    /**
    * Event callback for clicking on product thumbnails
    */
    productImageThumbSelect: function(evt) {
      evt.preventDefault();
      this.removeZoom();
      $(selectors.productFeaturedImage, this.$container).attr('src', $(evt.currentTarget).attr('href'));
      window.setTimeout(this.resetZoom,250);
    },

    /**
    * Event callback for clicking on product slider thumbnails
    */
    productSliderThumbSelect: function(evt) {
      evt.preventDefault();
      var slide_index = -1, slide_jump = -1, this_thumb = $(evt.currentTarget);
      $(selectors.productImageSlider + " .product-image-slide", this.$container).each(function() {
        if($(this).hasClass("slick-cloned")) return true;
        slide_index++;
        if($(this).data('image') == $(this_thumb).data('image'))
        {
          slide_jump = slide_index;
          return false;
        }
      });

      if(slide_jump >= 0)
        $(selectors.productImageSlider, this.$container).slick('slickGoTo', slide_jump);
    },

    /**
    * Updates the DOM state of the add to cart button
    *
    * @param {boolean} enabeled - Decides whether cart is enabled or disabled
    * @param {string} text - Updates the text notification content of the cart
    */
    updateAddToCartState: function(evt) {
      var variant = evt.variant;
      this.variantImageGallery(variant);

      if (variant) {
        for (var i=0,length=variant.options.length; i<length; i++) {
          var radioButton = this.$container.find('.swatch[data-option-index="' + escape(i) + '"] :radio[value="' + variant.options[i].replace(/\"/g,'\\"') +'"]');
          if (radioButton.length) {
            radioButton.get(0).checked = true;
          }
        }
        $(selectors.priceWrapper, this.$container).removeClass('hide');
        this.variantData(variant);
        window.setTimeout(this.resetZoom,250);
      } else {
        $(selectors.addToCart, this.$container).prop('disabled', true);
        $(selectors.addToCartText, this.$container).html(theme.strings.unavailable);
        $(selectors.priceWrapper, this.$container).addClass('hide');
        $(selectors.outStockNotify, this.$container).addClass('active');
        return;
      }

      if (variant.available) {
        $(selectors.addToCart, this.$container).prop('disabled', false);
        $(selectors.addToCartText, this.$container).html(theme.strings.addToCart);
        $(selectors.outStockNotify, this.$container).removeClass('active');
      } else {
        $(selectors.addToCart, this.$container).prop('disabled', true);
        $(selectors.addToCartText, this.$container).html(theme.strings.soldOut);
        $(selectors.outStockNotify, this.$container).addClass('active');
      }
    },

    /**
    * Updates the DOM with variant data based on variant data selectors
    */
    variantData: function(variant) {
      for(var key in variant)
        $("[data-variant-" + key + "]").text(variant[key]);
    },

    /**
    * Updates the DOM with specified prices
    *
    * @param {string} productPrice - The current price of the product
    * @param {string} comparePrice - The original price of the product
    */
    updateProductPrices: function(evt) {
      var variant = evt.variant;
      var $comparePrice = $(selectors.comparePrice, this.$container);
      var $compareEls = $comparePrice.add(selectors.comparePriceText, this.$container);

      $(selectors.productPrice, this.$container)
        .html(slate.Currency.formatMoney(variant.price, theme.moneyFormat)).removeClass('price-altered');

      if (variant.compare_at_price > variant.price) {
        $comparePrice.html(slate.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat)).removeClass('price-altered');
        $compareEls.removeClass('hide');
      } else {
        $comparePrice.html('').removeClass('price-altered');
        $compareEls.addClass('hide');
      }

      //update custom pricing displays based on pricing rules
      init_price_display(this.$container);
    },

    /**
    * Updates the DOM with the specified image URL
    *
    * @param {string} src - Image src URL
    */
    updateProductImage: function(evt) {
      var variant = evt.variant;
      var sizedImgUrl = slate.Image.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);

      $(selectors.productFeaturedImage, this.$container).attr('src', sizedImgUrl);
      this.updateSliderVariant();
    },

    updateSliderVariant: function() {
      var current_variant = $(selectors.variantCurrent, this.$container).text(), slide_index = -1, slide_jump = -1;
      $(selectors.productImageSlider + " .product-image-slide", this.$container).each(function() {
        if($(this).hasClass("slick-cloned")) return true;
        slide_index++;
        if($(this).data('variants').toString().indexOf(current_variant) >= 0)
        {
          slide_jump = slide_index;
          return false;
        }
      });

      if(slide_jump >= 0)
        $(selectors.productImageSlider, this.$container).slick('slickGoTo', slide_jump);
    },

    /**
    * Event callback for Theme Editor `section:unload` event
    */
    onUnload: function() {
      this.$container.off(this.namespace);
    }
  });

  return Product;
})();
/**
 * Dyno Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Dyno templates.
 *
   * @namespace dyno
 */
 /* global $ */
 /* global theme */
 /* global slate */

theme.Dyno = (function() {

  var selectors = {
    videoContainer: "[data-video]",
    videoPlayButton: "[data-video-play]",
    swatchContainer: '[data-collection-swatches]'
  };

  /**
   * Dyno section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Dyno(container) {
    this.$container = $(container);
    var sectionId = this.$container.attr('data-section-id');

    this.settings = {};
    this.namespace = '.dyno';
    this.init_sliders();
    this.init_video();
    this.init_collection_swatches();
  }

  Dyno.prototype = $.extend({}, Dyno.prototype, {

    /**
     * Run through section and initialize any sliders with properties based on data attributes
     */
    init_sliders: function() {
      this.$container.find(".dyno-slider").each(function() {
        $(this).slick({
          arrows: $(this).data("sliderArrows"),
          dots: $(this).data("sliderDots"),
          infinite: $(this).data("sliderInfinite"),
          slidesToShow: $(this).data("sliderSlidesToShow"),
          slidesToScroll: $(this).data("sliderSlidesToScroll"),
          autoplay: $(this).data("sliderAutoplay"),
          autoplaySpeed: 1000*parseInt($(this).data("sliderAutoplaySecs")),
          speed: $(this).data("slider-speeed"),
          responsive: [
            {
              breakpoint: window.theme.shopSettings["mobile_width_max"],
              settings: {
                slidesToShow: $(this).data("sliderSlidesToShowSmall"),
                slidesToScroll: $(this).data("sliderSlidesToShowSmall")
              }
            },
            {
              breakpoint: window.theme.shopSettings["tablet_width_max"],
              settings: {
                slidesToShow: $(this).data("sliderSlidesToShowMedium"),
                slidesToScroll: $(this).data("sliderSlidesToShowMedium")
              }
            }
          ]
        });

      });
    },

    /**
     * Collection swatches
     */
    init_collection_swatches: function() {

      if($(selectors.swatchContainer, this.$container).length > 0)
      {

        $('body').on('click', '.swatch span', function() {

          var optionIndex = $(this).closest('.swatch').attr('data-option-index');
          var optionValue = $(this).closest('.swatch').attr('data-value');

          /* Update Images */
          if($(this).data("image").indexOf("no-image") == -1) {
            $(this).parents('.product-grid-item').find('.prod-img img:first-child').attr('src', $(this).data("image"));
          }
          if($(this).data("secimg").indexOf("no-image") == -1) {
            $(this).parents('.product-grid-item').find('.prod-img .sec-img').attr('src', $(this).data("secimg"));
          }

          /* Update Image Link */
          $(this).parents('.product-grid-item').find('.prod-img').attr('href', $(this).closest('.swatch').data("variant-link"));

          /* Update Active State */
          $(this).parents('.collection_swatches').find('.active').removeClass('active');
          $(this).closest('.swatch').addClass('active');

          var active_swatch_values = [];
          $(this).closest('.product-grid-item').find(".swatch.active").each(function() {
            active_swatch_values.push($(this).data('value'));
          });

          /* Update the select dropdown with chosen swatch for add to cart functionality */
          var optionId = $(this)
            .closest('.product-grid-item-form')
            .find('[data-option-selector] option[data-option1="' + active_swatch_values[0] + '"][data-option2="' + active_swatch_values[1] + '"]').val();

          if(optionId != undefined) {
            $(this)
            .closest('.product-grid-item-form')
            .find('[data-option-selector]')
            .val(optionId)
            .trigger('change');

            $(this)
            .closest('.product-grid-item-form')
            .find('[data-add2cart]')
            .text('Add to Cart')
            .attr('disabled', false);

          } else {

            $(this)
            .closest('.product-grid-item-form')
            .find('[data-add2cart]')
            .text('Sold Out')
            .attr('disabled', true);
          }

        });
      }
    },

    /**
     * Run through section and setup video play buttons
     */
    init_video: function() {
      this.$container.on('click', selectors.videoPlayButton, this.videoPlay.bind(this));
    },

    /**
     * Event callback for clicking to start a video
     */
     videoPlay: function(evt) {
        var $button = $(evt.currentTarget);
        var $video_container = $button.closest(selectors.videoContainer);
        var $iframe = $video_container.find('iframe');
        $video_container.css('background-image', 'none');
        $button.hide();
        var iframe_src = $iframe.data('src');
        if(iframe_src.indexOf('?') >= 0)
          iframe_src += "&amp;autoplay=1";
        else
          iframe_src += "?autoplay=1";
        $iframe.attr('src',iframe_src).show();
     },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    }
  });

  return Dyno;
})();

/**
 * Instagram Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts for the instagram sections
 *
   * @namespace instagram-section
 */
 /* global $ */
 /* global theme */
 /* global slate */

theme.instagrams = {};
theme.InstagramSection = (function(){

 function InstagramSection(container){
   var $container = this.$container = $(container);
   var id = $container.attr('data-section-id');
   var instagram = this.instagram = '#Instagram-' + id;

   // Only support IE9 and above
   if($('html').hasClass('lt-ie9')){
     return false;
   }

   var $shotContainer = $container.find('.instagram-container');
   var $profileLink = $container.find('.button');
   var imageCount = $container.data('image-count');
   var accessToken = $container.data('instagram-access-token');
   var hashTag = $container.data('hash-tag').replace('#','').toLowerCase();
   var apiURL = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + accessToken + '&count=20';
   if(hashTag != "")
    apiURL = 'https://api.instagram.com/v1/tags/' + hashTag + '/media/recent?access_token=' + accessToken + '&count=20';

   // Set how long the localStorage is valid for 12 hours
   var expireTime = 1000 * 60 * 60 * 12; // ms * s * m * 12 hours

   // Helper Text
   var addAccessToken = "Don't forget to add your Instagram access token";
   var invalidAccessToken = "Invalid Instagram access token";
   var rateLimitAccessToken = "Error. Too many Instagram requests";
   var storeWithExpiration = {
   	set: function(key, val, exp) {
   		store.set(key, { val:val, exp:exp, time:new Date().getTime() })
   	},
   	get: function(key) {
   		var info = store.get(key)
   		if (!info) { return null }
   		if (new Date().getTime() - info.time > info.exp) { return null }
   		return info.val
   	}
   }

   // AJAX call to load Instagram API data
   var getData = function(){
     // Check if access token exists
     if(accessToken){
       $.ajax({
         url: apiURL,
         dataType: "jsonp",
         timeout: 5000,
         success: function(data) {
           switch (data.meta.code) {
             case 400:
               $shotContainer.attr('data-helper-text', invalidAccessToken);
               storeWithExpiration.set(accessToken, data, expireTime);
               $container.show();
               break;
             case 429:
               $shotContainer.attr('data-helper-text', rateLimitAccessToken);
               $container.show();
               break;
             default:
               loadImages(data);
               storeWithExpiration.set(accessToken, data, expireTime);
           }
         }
       });
     } else {
       // Show helper with details of adding token
       $shotContainer.attr('data-helper-text', addAccessToken);
       $container.show();
     }

   }

   // Load in all the recent media in the Instagram data
   var loadImages = function(data){
     // Check to ensure valid data
     if(data.data){
       if (data.data.length < imageCount) {
         var dataCount = data.data.length;
         var settingsCount = imageCount;
         var lastIndex = settingsCount - (settingsCount - dataCount);
         imageCount = data.data.length;

         // Remove the extra holders
         $container.find('.box').each(function(i){
           if(i >= lastIndex){
             $(this).hide();
           }
         });
       }
       for (var i = 0; i < imageCount; i++) {
         var thumbnail = data.data[i].images.thumbnail.url;
         var low_resolution = data.data[i].images.low_resolution.url;
         var medium_resolution = thumbnail.replace('s150x150', 's480x480');
         var standard_resolution = data.data[i].images.standard_resolution.url;
         //fix for non square images
         // thumbnail = low_resolution.replace(new RegExp('vp\/[^\/]*', 'g'), 'hphotos-xfp1');

         var link = data.data[i].link;
         var likes = data.data[i].likes.count;
         var comments = data.data[i].comments.count;

         var caption = '';
         if(data.data[i].caption){
           caption = data.data[i].caption.text;
         }

         var $shot = $container.find('.box-' + i);
         var $shotImageContainer = $shot.find('a');
         var $shotLinks = $shot.find('a');
         var $shotCaption = $shot.find('figcaption > p');
         var $shotLikes = $shot.find('a.likes span.label');
         var $shotComments = $shot.find('a.comments span.label');

         // Add image
         $shotImageContainer.html('<img class="card__image lazyload">');
         var $shotImage =  $shotImageContainer.find('.card__image');
         $shotImage.attr('data-sizes', 'auto');
         $shotImage.attr('src', thumbnail);
         $shotImage.attr('data-srcset', thumbnail + ' 150w, ' +
                                        low_resolution + ' 320w, ' +
                                        medium_resolution + ' 480w, ' +
                                        standard_resolution + ' 640w');
         $shotImage.attr('src', low_resolution);
         $shotImage.attr('alt', $('<div/>').html(caption).text());

         // Set shot data
         $shotLinks.attr('href', link);
         $shotCaption.html(caption);
         $shotLikes.text(likes);
         $shotComments.text(comments);

         $shot.removeClass('shot-0');
         $shot.addClass('shot-' + i);
       }
       var instagramFeed = 'https://www.instagram.com/explore/tags/' + hashTag + '/';
       if(hashTag == "") instagramFeed = 'https://www.instagram.com/' + data.data[0].user.username;
       $profileLink.attr('href', instagramFeed);
       $profileLink.attr('target', '_blank');

       $container.show();
       $shotContainer.addClass('loaded');
     }
   }

   // localStorage - check to see if the api data exists and is current
   if(document.location.search.indexOf("instareset") == -1 && storeWithExpiration.get(accessToken)){
     var data = storeWithExpiration.get(accessToken);
     loadImages(data);
   } else {
     getData();
   }


   theme.instagrams[instagram] = this;
   //$container.show();
 }

 return InstagramSection;
})();

theme.InstagramSection.prototype = $.extend({}, theme.InstagramSection.prototype, {
 onUnload: function() {
   delete theme.instagrams[this.instagram];
 }
});
/**
 * Collection Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection templates.
 *
   * @namespace collection
 */
 /* global $ */
 /* global theme */
 /* global slate */

theme.MegaMenus = (function() {

  var selectors = {
    megaMenus: '[data-mega-menu]',
    parentNav: '.parent-nav'
  };

  /**
   * MegaMenus section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function MegaMenus(container) {
    this.$container = $(container);
    var sectionId = this.$container.attr('data-section-id');

    this.settings = {};
    this.namespace = '.mega-menu';
    this.init_menus();
  }

  MegaMenus.prototype = $.extend({}, MegaMenus.prototype, {

    /**
     * Setup sort by select and the change callback
     */
    init_menus: function() {
      $(selectors.megaMenus, this.$container).each(function() {
        $(selectors.parentNav + " li[data-parent=" + $(this).data('parent') +"] a").removeClass("nav-link-toggle").next(".menu").remove()
        $(selectors.parentNav + " li[data-parent=" + $(this).data('parent') +"] a").attr('data-toggle', $(this).data('menu'));
      });
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    }

  });

  return MegaMenus;
})();


/*================ Templates ================*/
/**
 * Customer Addresses Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Customer Addresses
 * template.
 *
 * @namespace customerAddresses
 */

theme.customerAddresses = (function() {
  var $newAddressForm = $('#AddressNewForm');

  if (!$newAddressForm.length) {
    return;
  }

  // Initialize observers on address selectors, defined in shopify_common.js
  if (Shopify) {
    new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
      hideElement: 'AddressProvinceContainerNew'
    });
  }

  // Initialize each edit form's country/province selector
  $('.address-country-option').each(function() {
    var formId = $(this).data('form-id');
    var countrySelector = 'AddressCountry_' + formId;
    var provinceSelector = 'AddressProvince_' + formId;
    var containerSelector = 'AddressProvinceContainer_' + formId;

    new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
      hideElement: containerSelector
    });
  });

  // Toggle new/edit address forms
  $('.address-new-toggle').on('click', function() {
    $newAddressForm.toggleClass('hide');
  });

  $('.address-edit-toggle').on('click', function() {
    var formId = $(this).data('form-id');
    $('#EditAddress_' + formId).toggleClass('hide');
  });

  $('.address-delete').on('click', function() {
    var $el = $(this);
    var formId = $el.data('form-id');
    var confirmMessage = $el.data('confirm-message');
    if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
      Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
    }
  });
})();

/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Password template.
 *
 * @namespace password
 */

theme.customerLogin = (function() {
  var config = {
    recoverPasswordForm: '#RecoverPassword',
    hideRecoverPasswordLink: '#HideRecoverPasswordLink'
  };

  if (!$(config.recoverPasswordForm).length) {
    return;
  }

  checkUrlHash();
  resetPasswordSuccess();

  $(config.recoverPasswordForm).on('click', onShowHidePasswordForm);
  $(config.hideRecoverPasswordLink).on('click', onShowHidePasswordForm);

  function onShowHidePasswordForm(evt) {
    evt.preventDefault();
    toggleRecoverPasswordForm();
  }

  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  /**
   *  Show/Hide recover password form
   */
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
  }

  /**
   *  Show reset password success message
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('hide');
  }
})();

/**
 * Customer Orders Scripts
 * ------------------------------------------------------------------------------
 * A file that contains scripts to handle things with customer orders
 *
 * @namespace account
 */

theme.customerOrders = (function() {
  var config = {
    orderReorder: '.order-reorder',
    orderData: '#order-data-',
    reorderQueue: []
  };

  if (!$(config.orderReorder).length) {
    return;
  }

  $(config.orderReorder).on('click', reorder);

  //function for automatically populating a cart with items from a previous order
  function reorder(event)
  {
    config.reorderQueue = JSON.parse($(config.orderData+$(this).data('order')).val());

    swal({
      title: "Re-Order",
      text: "Are you sure you would like to add these items back into your cart?",
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      showLoaderOnConfirm: true,
    },
    function(){
      reorder_process();
    });
  }

  function reorder_process()
  {
    var this_line,this_add;

    // If we still have requests in the queue, let's process the next one.
    if (config.reorderQueue.length) {
      this_line = config.reorderQueue.shift();

      this_add = {};
      this_add.id = this_line.variant_id;
      this_add.quantity = this_line.quantity;
      this_add.properties = this_line.properties;

      $.ajax({
        type: "POST",
        url: '/cart/add.js',
        data: this_add,
        dataType: "json",
        success: reorder_process,
        fail: function() {
          swal("Re-Order","Errors occurred unfortunately. Please try again.");
        }
      });
    }
    // If the queue is empty, we will redirect to the cart page.
    else {
      global_UpdateCart();
      global_CartToggle(null, "/cart");
      swal.close();
    }
  }

})();

/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Password template.
 *
 * @namespace password
 */

theme.passwordPage = (function() {

  $('.login-button').click(function(e){
    $('#Login').fadeToggle(300);
  });

  $('.exout-button').click(function(e){
    $('#Login').fadeToggle(300);
  });

})();


$(document).ready(function() {
  var sections = new slate.Sections();
  sections.register('collection', theme.Collection);
  sections.register('product', theme.Product);
  sections.register('dyno', theme.Dyno);
  sections.register('featured-collection', theme.FeaturedCollection);
  sections.register('instagram-section', theme.InstagramSection);
  sections.register('mega-menu', theme.MegaMenus);

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  // Wrap videos in div to force responsive layout.
  slate.rte.wrapTable();
  slate.rte.iframeReset();

  // Apply a specific class to the html element for browser support of cookies.
  if (slate.cart.cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }

  // Initializing Foundation
  $(document).foundation();
});
