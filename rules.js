var fs = require('fs');
var path = require('path');
var YAML = require('yaml');
var mime = require('mime-types');

var rules = YAML.parse(fs.readFileSync('./rules.yml', 'utf-8')).filter(rule => !rule.disabled);
var whiteListedDomains = YAML.parse(fs.readFileSync('./whitelistedDomains.yml', 'utf-8'));

const stringTextExtensions = ['js', 'css', 'txt', 'html'];

module.exports = {
  summary: 'a rule to hack response',
  *beforeSendRequest(requestDetail) {
    var requestUrl = requestDetail.url;
    // console.log('requestUrl', requestUrl);
    var matchingRule = rules.find((rule) => matchRule(rule, requestUrl));
    if (matchingRule) {
      console.log('matched', requestUrl);
      var {body, contentType} = handleResponseBody(matchingRule, requestUrl);
      // console.log(body);
      return {
        response: {
          statusCode: 200,
          header: { 
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*' 
          },
          body
        }
      };
    }
    return null
  },

  *beforeDealHttpsRequest(requestDetail) {
    var requestUrl = requestDetail.host.split(':')[0];
    // return whiteListedDomains.includes(requestUrl) ? (console.log('allowed'),  true): false ;
    return true;
  }
};

function matchRule(rule, requestUrl) {
  if(rule.type && rule.type.toUpperCase() === "REGEX") {
    var r = new RegExp(rule.url);
    // console.log('-----------', r.test(requestUrl), '-----------');

    return r.test(requestUrl);
  }
  else {
    console.log(requestUrl);
    return requestUrl.includes(rule.url)
  }
}

function handleResponseBody(rule, requestUrl) {
  
  // console.log('groups', groups);
  if(rule.fileNamePattern) {
    var r = new RegExp(rule.url)
    var results = r.exec(requestUrl);
    var groups = results.slice(1);
    
    var stringsToBeReplaced = rule.fileNamePattern.match(/\$\d+/g);
    var fileName = rule.fileNamePattern;
    stringsToBeReplaced.forEach((str, index) => {
      fileName = fileName.replace(str, groups[index]);
    });

    console.log('fileName', fileName);
    var body = handleUTF8File(fileName);
    
    return {
      body,
      contentType: mime.contentType(path.extname(fileName))
    };
  }
  else {
    var body = handleUTF8File(rule.fileName);
    console.log('fileName', rule.fileName);
    
    return {
      body,
      contentType: mime.contentType(path.extname(rule.fileName))
    };
  }
}

function handleUTF8File (fileName) {
  const fileExtension = path.extname(fileName).slice(1);
  const isUTF8Readable = stringTextExtensions.find(item => item === fileExtension) ? true: false;
  return isUTF8Readable 
    ? fs.readFileSync(path.resolve(fileName), "utf-8")
    : fs.readFileSync(path.resolve(fileName))
}