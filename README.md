# Query Combinator
The query combinator sets up and generates all possible combinations of queries based on a provided configuration by concatenating a URL with all combinatory outputs that result from mixing parameters.

## Prerequisites
In order to use the class, __Node.js__ needs to be installed on your machine, to do so, please visit the [Node.js downloads page](https://nodejs.org/en/download/package-manager/) and install the right package for your system.

## Basic Example
The following example generates a `sales` query by fixing a `sku` parameter that will be always present and mixing it with a `class` and a `department` parameters by combining all possible subsets of the provided values.

```javascript
QueryGen.query('Sales')
        .host('http://localhost:8080')
        .url('/sales')
        .fixParam('sku', '1232456')
        .mixParam('class', ['c1', 'c2'])
        .mixParam('department', ['d1', 'd2', 'd3'])
        .generate();
```

## Running Example Configuration
```sh
# set the global environment variables
source ./script/env.sh

# run the example
./example/run-queries
```

## API
TBD...

## Project Structure
The tree below illustrates the directory structure for this application:

```
.
├── example
│   ├── queryConfig.js    # example configuration
│   └── run-queries       # shell script to run the example and generate a report
├── script
│   └── env.sh            # sets up the required environment variables
├── src
│   └── QueryGen.js       # query combinator and generator class
├── report                # generated report after running the example script
└── README.md             # project readme
```
