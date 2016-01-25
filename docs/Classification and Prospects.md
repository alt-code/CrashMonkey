This document contains the research into classifying the landscape of node.js projects in the real world and classifying them into similar types. Prospects are a list of viable candidates that look suitable for this study based on their function, ease of understanding and maturity of test case coverage. 

## Classification of projects
1. **Pattern matching / Transformation**   
    • Internal - DOM, Underscore, cheerio  
    • External - Jade, less, glob  
    • Algorithmic (Complex transformations) - fourier, sentiment, language detection
2. **Control Flow**  
    • Async management - Async, promise  
    • Task management - Grunt, gulp  
3. **Frameworks**  
    • Web - Express, passport, static file  
    • Test - mocha, jasmine  
4. **External**  
    • Network - request, redis  
    • Data - sqlite3, mongoose  
    • Process
5. **Reporting**  
    • Os and hardware parameters reporting
	
## Prospects
|Library|Desc|Test Framework|Comment|
|---|---|---|---|
|[Minimist](https://github.com/substack/minimist)|Command line argument parser|Tape|Transformation type library|
|[Glob](https://github.com/isaacs/node-glob)|File pattern finder|Tape|External type library|
|[Cheerio](https://github.com/cheeriojs/cheerio)|XML/HTML parser|Mocha|Transformation type library|
|[Underscore](https://github.com/jashkenas/underscore)|Utility function library|Qunit|Transformation type library, has tests for server and client side|
|[Async](https://github.com/caolan/async)|Async control flow manager|Nodeunit/Mocha|Control flow type library, has tests for server and client side|

#### Test coverage
* Minimist - Extensive, easy to understand
* Glob - Extensive, slightly complex and requires file system mocking
* Cheerio - Extensive, simple
* Underscore - Quite Extensive albeit simple. Designed for client and server side
* Async - Extensive, complex due to inherent async nature of functionality. Designed for client and server side 
	