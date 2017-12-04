var _ = require('lodash'),  odd = module.exports;
exports.config = require("./lib/config");
exports.utils = require("./lib/utils");
exports.uploader = require("./lib/uploader");
exports.api = require("./lib/api");
exports.PreloadedFile = require("./lib/preloaded_file");

exports.url = function(public_id, options) {
  options = _.extend({}, options);
  return odd.utils.url(public_id, options);
};

exports.image = function (source, options) {
  var responsive, html, current_class, classes;
  options = _.extend({}, options);
  source = odd.utils.url(source, options);
  if ("html_width" in options) options["width"] = odd.utils.option_consume(options, "html_width");
  if ("html_height" in options) options["height"] = odd.utils.option_consume(options, "html_height");

  client_hints = odd.utils.option_consume(options, "client_hints", odd.config().client_hints);
  responsive = odd.utils.option_consume(options, "responsive");
  hidpi = odd.utils.option_consume(options, "hidpi");

  if ((responsive || hidpi) && !client_hints) {
    options["data-src"] = source;
    classes = [responsive ? "cld-responsive" : "cld-hidpi"];
    current_class = odd.utils.option_consume(options, "class");
    if (current_class) classes.push(current_class);
    options["class"] = classes.join(" ");
    source = odd.utils.option_consume(options, "responsive_placeholder", odd.config().responsive_placeholder);
    if (source == "blank") {
      source = odd.BLANK;
    }
  }
  html = "<img ";
  if (source) html += "src='" + source + "' ";
  html += odd.utils.html_attrs(options) + "/>";
  return html;
};

/**
 * Creates an HTML video tag for the provided public_id
 * @param {String} public_id the resource public ID
 * @param {Object} [options] options for the resource and HTML tag
 * @param {(String|Array<String>)} [options.source_types] Specify which
 *        source type the tag should include. defaults to webm, mp4 and ogv.
 * @param {String} [options.source_transformation] specific transformations
 *        to use for a specific source type.
 * @param {(String|Object)} [options.poster] image URL or
 *        poster options that may include a <tt>public_id</tt> key and
 *        poster-specific transformations
 * @example <caption>Example of generating a video tag:</caption>
 * $.odd.video("mymovie.mp4");
 * $.odd.video("mymovie.mp4", {source_types: 'webm'});
 * $.odd.video("mymovie.ogv", {poster: "myspecialplaceholder.jpg"});
 * $.odd.video("mymovie.webm", {source_types: ['webm', 'mp4'], poster: {effect: 'sepia'}});
 * @return {string} HTML video tag
 */
exports.video = function (public_id, options) {
  var src, video_options, fallback, source_transformation, source_types, source, multi_source, html;
  options = _.extend({}, options);
  public_id = public_id.replace(/\.(mp4|ogv|webm)$/, '');
  source_types = odd.utils.option_consume(options, 'source_types', []);
  source_transformation = odd.utils.option_consume(options, 'source_transformation', {});
  fallback = odd.utils.option_consume(options, 'fallback_content', '');

  if (source_types.length === 0) source_types = odd.utils.DEFAULT_VIDEO_SOURCE_TYPES;
  video_options = _.cloneDeep(options);

  if (video_options.hasOwnProperty('poster')) {
    if (_.isPlainObject(video_options.poster)) {
      if (video_options.poster.hasOwnProperty('public_id')) {
        video_options.poster = odd.utils.url(video_options.poster.public_id, video_options.poster);
      } else {
        video_options.poster = odd.utils.url(public_id, _.extend({}, odd.utils.DEFAULT_POSTER_OPTIONS, video_options.poster));
      }
    }
  } else {
    video_options.poster = odd.utils.url(public_id, _.extend({}, odd.utils.DEFAULT_POSTER_OPTIONS, options));
  }

  if (!video_options.poster) delete video_options.poster;

  html = '<video ';

  if (!video_options.hasOwnProperty('resource_type')) video_options.resource_type = 'video';
  multi_source = _.isArray(source_types) && source_types.length > 1;
  source = public_id;
  if (!multi_source) {
    source = source + '.' + odd.utils.build_array(source_types)[0];
  }
  src = odd.utils.url(source, video_options);
  if (!multi_source) video_options.src = src;
  if (video_options.hasOwnProperty("html_width")) video_options.width = odd.utils.option_consume(video_options, 'html_width');
  if (video_options.hasOwnProperty("html_height")) video_options.height = odd.utils.option_consume(video_options, 'html_height');
  html = html + odd.utils.html_attrs(video_options) + '>';
  if (multi_source) {
    var source_type, transformation, video_type, mime_type;
    for (var i = 0; i < source_types.length; i++) {
      source_type = source_types[i];
      transformation = source_transformation[source_type] || {};
      src = odd.utils.url(source + "." + source_type, _.extend({resource_type: 'video'}, _.cloneDeep(options), _.cloneDeep(transformation)));
      video_type = source_type === 'ogv' ? 'ogg' : source_type;
      mime_type = "video/" + video_type;
      html = html + '<source ' + odd.utils.html_attrs({
        src: src,
        type: mime_type
      }) + '>';
    }
  }

  html = html + fallback;
  html = html + '</video>';
  return html;
};
exports.odd_js_config = odd.utils.odd_js_config;

exports.CF_SHARED_CDN = odd.utils.CF_SHARED_CDN;
exports.AKAMAI_SHARED_CDN = odd.utils.AKAMAI_SHARED_CDN;
exports.SHARED_CDN = odd.utils.SHARED_CDN;
exports.BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
exports.v2 = require('./lib/v2');