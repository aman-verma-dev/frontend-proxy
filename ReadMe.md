# Custom Rules to be used with AnyProxy

Anyproxy is a forward proxy developed by Alibaba

1. [Anyproxy Documentation](https://anyproxy.io/en/ "Anyproxy Documentation")
2. [Source Code](https://github.com/alibaba/anyproxy "Source Code")
3. [Custom Rules Documentation](http://anyproxy.io/en/#rule-module-interface "Custom Rules Documentation")

## Set up Instructions

npm install -g anyproxy

Version: 4.1.2

## Run AnyProxy

### Default configuration 
`anyproxy`

### Custom Port
`anyproxy --port 8888`

### Our Configuration
`anyproxy --port 8888 --intercept --rule rules.js`