function Article (opts) {
  this.author = opts.author;
  this.authorUrl = opts.authorUrl;
  this.title = opts.title;
  this.category = opts.category;
  this.body = opts.body;
  this.publishedOn = opts.publishedOn;
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

Article.loadAll = function(rawData) {
  rawData.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  rawData.forEach(function(ele) {
    Article.all.push(new Article(ele));
  });
};

// This function will retrieve the data from either a local or remote source,
// and process it, then hand off control to the View.
Article.fetchAll = function() {
  var url = 'data/hackerIpsum.json';
  var eTag;
  var jqXHR = $.ajax({
    url: url,
    type: 'HEAD',
    dataType: 'json',
    success: function () {
      eTag = jqXHR.getResponseHeader('ETag');
      if ((localStorage.eTag === eTag) && (localStorage.rawData)) {
        Article.loadAll(JSON.parse(localStorage.rawData));
        articleView.initIndexPage();
        console.log('pulled from local');
      } else {
        $.getJSON(url, function (rawData) {
          Article.loadAll(rawData);
          localStorage.rawData = JSON.stringify(rawData);
          localStorage.eTag = eTag;
          articleView.initIndexPage();
        });
        console.log('pulled from file');
      }
    }

  });

};
