from flask import Flask, jsonify, request, render_template, flash, request, redirect, url_for, send_from_directory
import os, io, json
import pandas as pd
import pickle
from flask_cors import CORS

from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './downloads/'
FILES_DIRECTORY = './files'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

DOMAIN_NAME = 'how-ya-reeling.cmasterx.com:5000/'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/saving', methods=['GET', 'POST'])
def saving():
    if request.method == 'POST':
        # return 'Post'
        
        # if 'file_save' in request.args:
        if 'data' in request.form and 'filename' in request.form:
            filename = secure_filename(request.form['filename'])

            with open('{}/{}'.format(FILES_DIRECTORY, filename), 'wb') as f:
                pickle.dump(request.form['data'], f)

            return 'Success'
            
        # print(request.files)
        
        # data = request.data
        # print(data)
        # return data
        # filename = secure_filename(request.args['file_save'])

        # with open('{}/{}'.format(FILES_DIRECTORY, filename), 'wb') as file:
        #     pickle.dump(data, file)

        return 'Invalid POST'
        
    else:
        if 'filename' in request.args:
            filename = secure_filename(request.args['filename'])
            filepath = '{}/{}'.format(FILES_DIRECTORY, filename)
            
            with open(filepath, 'rb') as file:
                return pickle.load(file)

            return ''
    
    return 'Error'


@app.route('/api', methods=['GET', 'POST'])
def test():
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'NULL'

        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return 'NO_NAME'

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            print('Filename: {}'.format(filename))
            return jsonify({'url': '{}image/{}'.format(DOMAIN_NAME, filename), 'valid' : 'yes'})
            # return """{}image/{}
            # """.format(DOMAIN_NAME, filename)
        else:
            return jsonify({'valid': 'no'})
            


@app.route('/', methods=['GET', 'POST'])
def default():
    return upload_file('')

@app.route('/<path:path>', methods=['GET', 'POST'])
def upload_file(path):
    if request.method == 'GET':

        if path == '':
            return send_from_directory('../', 'index.html')
        
        print('Path"{}"'.format(path))
        
        return send_from_directory('../', path)
        
        
if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5001)

