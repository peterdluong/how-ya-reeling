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

SAMPLE_MOOD = {
    'joy' : {
        '0' : {
            'anger'                : 1,
            'joy'                  : 5,
            'surprise'             : 1,
            'sorrow'               : 1,
            'detection_confidence' : 0.999
        }
    },
    'anger' : {
        '0' : {
            'anger'                : 5,
            'joy'                  : 1,
            'surprise'             : 1,
            'sorrow'               : 1,
            'detection_confidence' : 0.999
        }
    },
    'surprise' : {
        '0' : {
            'anger'                : 1,
            'joy'                  : 1,
            'surprise'             : 5,
            'sorrow'               : 1,
            'detection_confidence' : 0.999
        }
    },
    'sorrow' : {
        '0' : {
            'anger'                : 1,
            'joy'                  : 1,
            'surprise'             : 1,
            'sorrow'               : 5,
            'detection_confidence' : 0.999
        }
    }
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# path to file
def detect_mood(path):
    """Detects faces in an image."""
    from google.cloud import vision
    import io
    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.types.Image(content=content)

    response = client.face_detection(image=image)
    faces = response.face_annotations

    # Names of likelihood from google.cloud.vision.enums
    likelihood_name = ('UNKNOWN', 'VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE',
                       'LIKELY', 'VERY_LIKELY')
    # print('Faces:')

    faceData = {}
    
    for i in range(len(faces)):
        face = faces[i]

        faceObj = {
            'anger'                : face.anger_likelihood,
            'joy'                  : face.joy_likelihood,
            'surprise'             : face.surprise_likelihood,
            'sorrow'               : face.sorrow_likelihood,
            'detection_confidence' : face.detection_confidence
        }

        faceData[i] = faceObj
    
    if response.error.message:
        raise Exception(print('Error: {}'.format(response.error.message)))

    return faceData


@app.route('/api', methods=['GET', 'POST'])
def api():
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
            
@app.route('/saving', methods=['GET', 'POST'])
def saving():
    if request.method == 'POST':
        # return 'Post'
        
        # if 'file_save' in request.args:
        if 'data' in request.form and 'filename' in request.form:
            filename = secure_filename(request.form['filename'])

            print ('Valid')
            with open('{}/{}'.format(FILES_DIRECTORY, filename), 'wb') as f:
                pickle.dump(request.form['data'], f)
                print('Finish dump')
                return 'Success'


        return 'Invalid POST'
        
    else:
        if 'filename' in request.args:

            filename = secure_filename(request.args['filename'])
            filepath = '{}/{}'.format(FILES_DIRECTORY, filename)
            
            if 'exists' in request.args:
                return jsonify({'exists' : os.path.exists(filepath)})
            
            try:
                file = open(filepath, 'rb')
                return jsonify(pickle.load(file))
            except FileNotFoundError:
                return jsonify({'filefound': False})


            with open(filepath, 'rb') as file:
                return pickle.load(file)

            return ''
    
    return 'Error'

# TODO add safety when invalid arguments is called
# examples: not an image file, image does not exist, secure filename
@app.route('/image/<path:path>', methods=['GET'])
def send_img(path):

    if 'vision' in request.args:
        responseType = request.args['vision'].lower()

        if responseType in SAMPLE_MOOD:
            return jsonify(SAMPLE_MOOD[responseType])
        elif responseType == 'all':
            faces = {}

            cnt = 0
            for mood in SAMPLE_MOOD:
                faces[cnt] = SAMPLE_MOOD[mood]['0']
                
                cnt += 1

            return faces
        
        elif responseType == 'list_moods':
            return jsonify({'moods' : ['joy', 'sorrow', 'surprise', 'anger']})
        
        elif responseType == 'google':
            
            json_path = './json/{}.json'.format(path)
            
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    data = json.load(f)
            else:
                with open(json_path, 'w') as f:
                    data = detect_mood('{}{}'.format(UPLOAD_FOLDER, path))
                    json.dump(data, f)
            
            return jsonify(data)
        else:
            return jsonify({'valid': 'no'})

    elif 'on_file' in request.args:
        data = {}
        data['image'] = os.path.exists('./downloads/{}'.format(path))       # boolean if image exists
        data['json'] = os.path.exists('./json/{}.json'.format(path))        # boolean if json file exists
        
        return jsonify(data)
        
    else:
        return send_from_directory('downloads', secure_filename(path))

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
    app.run(host="0.0.0.0",port=5000)

