import json
from flask import Flask
from flask import jsonify
from flask import request

import executor_utils as eu

app = Flask(__name__)


# GET /
@app.route('/')
def hello():
    return 'Hello World!'


# POST /build_and_run
@app.route('/build_and_run', methods=['POST'])
def build_and_run():
    print "Got called: %s" % (request.data)
    data = json.loads(request.data)
    print data

    if 'code' not in data or 'lang' not in data:
        return "You should provide both 'code' and 'lang'"
    code = data['code']
    lang = data['lang']

    print 'API got called with code: %s in %s' % (code, lang)

    eu.load_image()
    result = eu.build_and_run(code, lang)

    return jsonify(result),


if __name__ == '__main__':
    app.run(debug=True)
