import os
from flask import Flask, render_template, url_for, json
from flask import send_from_directory

app = Flask(__name__, static_url_path='')

@app.route('/')
def showjson():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "", "response.json")
    data = json.load(open(json_url))
    return render_template('showjson.jade', data=data)

@app.route('/data/<filename>')
def get_json(filename):
    return send_from_directory(".",filename, as_attachment=False)


if __name__ == '__main__':
    app.run()
