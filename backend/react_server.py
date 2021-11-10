# from cStringIO import StringIO
from flask import Flask, make_response, send_file, Response, request, send_from_directory
import soundfile as sf
import io
import base64
import numpy as np
from random import randint
from scipy.signal import convolve
from scipy.signal import resample_poly
import json
import datetime
from flask_cors import CORS
import pickle
import masking_slice
import compare_rest
import timbre_search
import helpers.constants as constants

#instrument_data_path='N:/Score-Tool iowa samples/out'
#instrument_data_path = 'c:/sample_database'
instrument_data_path=constants.instrument_data_path
#instrument_data_path='/Users/admin-upu10438/sample_library/sample_library'
#ir_data_path='N:/Score-Tool iowa samples'
#ir_data_path = 'c:/sample_database/musatalo'
ir_data_path=constants.ir_data_path
#ir_data_path='/Users/admin-upu10438/sample_library/sample_library/musatalo'

app = Flask(__name__)
CORS(app)

# Open a file
fo = open("./secret.txt", "r")
auth = fo.readline()
print(auth)

# Close opend file
fo.close()

with open('./no_data_orchestra.pickle', 'rb') as handle:
    orchestra = pickle.load(handle)

chord_selector_list = ['woodwinds', 'brass_and_flutes', 'orchestration_formant', 'singers_formant_demo']
pre_selected_chords = [
    {
        'title': 'Brass and flute example',
        'description': 'Two trumpets and trombone',
        'orchestration': [
        {'inst': 'flute', 'tech': 'normal', 'dynamic': 'mf', 'note': 72, 'target': True},
        {'inst': 'trumpet', 'tech': 'normal', 'dynamic': 'mf', 'note': 64, 'target': False},
        {'inst': 'trumpet', 'tech': 'normal', 'dynamic': 'mf', 'note': 60, 'target': False},
        {'inst': 'tenor_trombone', 'tech': 'normal', 'dynamic': 'mf', 'note': 52, 'target': False},
    ]
        },
    {
        'title': 'Woodwind chord example',
        'description': 'Four part chord, flute, oboe, clarinet and bassoon',
        'orchestration': [
        {'inst': 'flute', 'tech': 'normal', 'dynamic': 'p', 'note': 76, 'target': True},
        {'inst': 'oboe', 'tech': 'normal', 'dynamic': 'p', 'note': 64, 'target': False},
        {'inst': 'clarinet', 'tech': 'normal', 'dynamic': 'p', 'note': 55, 'target': False},
        {'inst': 'bassoon', 'tech': 'normal', 'dynamic': 'p', 'note': 48, 'target': False},
    ],
        },
    {
        'title': 'Orchestration formant example',
        'description': 'Example shows an ideal orchestration formant -timbre. The chord is a tutti chord, 32 instruments, from Liszt Les Preludes.',
        'orchestration': [  # Liszt Les Preludes
        {'inst': 'piccolo', 'tech': 'normal', 'dynamic': 'mf', 'note': 96, 'target': False},
        {'inst': 'flute', 'tech': 'normal', 'dynamic': 'mf', 'note': 91, 'target': False},
        {'inst': 'flute', 'tech': 'normal', 'dynamic': 'mf', 'note': 88, 'target': False},
        {'inst': 'clarinet', 'tech': 'normal', 'dynamic': 'mf', 'note': 84, 'target': False},
        {'inst': 'clarinet', 'tech': 'normal', 'dynamic': 'mf', 'note': 72, 'target': False},
        {'inst': 'oboe', 'tech': 'normal', 'dynamic': 'mf', 'note': 76, 'target': False},
        {'inst': 'oboe', 'tech': 'normal', 'dynamic': 'mf', 'note': 79, 'target': False},
        {'inst': 'trumpet', 'tech': 'normal', 'dynamic': 'mf', 'note': 72, 'target': False},
        {'inst': 'trumpet', 'tech': 'normal', 'dynamic': 'mf', 'note': 76, 'target': False},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'mf', 'note': 60, 'target': False},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'f', 'note': 64, 'target': True},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'mf', 'note': 67, 'target': False},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'mf', 'note': 72, 'target': False},
        {'inst': 'tenor_trombone', 'tech': 'normal', 'dynamic': 'mf', 'note': 60, 'target': False},
        {'inst': 'tenor_trombone', 'tech': 'normal', 'dynamic': 'mf', 'note': 64, 'target': False},
        {'inst': 'bass_trombone', 'tech': 'normal', 'dynamic': 'mf', 'note': 48, 'target': False},
        {'inst': 'bassoon', 'tech': 'normal', 'dynamic': 'mf', 'note': 48, 'target': False},
        {'inst': 'bassoon', 'tech': 'normal', 'dynamic': 'mf', 'note': 36, 'target': False},
        {'inst': 'tuba', 'tech': 'normal', 'dynamic': 'f', 'note': 36, 'target': False},
        {'inst': 'double_bass', 'tech': 'normal', 'dynamic': 'f', 'note': 36, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'f', 'note': 36, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'mf', 'note': 43, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'mf', 'note': 52, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'mf', 'note': 60, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 48, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 55, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 64, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 72, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 55, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 64, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 72, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 84, 'target': False},
    ]
        },
    {
        'title': '''Singer's formant example''',
        'description': '''Example shows how trained singer's voice cuts trough tutti orchestration ''',
        'orchestration': [  # Singer's formant
        {'inst': 'flute', 'tech': 'normal', 'dynamic': 'mf', 'note': 94, 'target': False},
        {'inst': 'flute', 'tech': 'normal', 'dynamic': 'mf', 'note': 91, 'target': False},
        {'inst': 'clarinet', 'tech': 'normal', 'dynamic': 'mf', 'note': 87, 'target': False},
        {'inst': 'clarinet', 'tech': 'normal', 'dynamic': 'mf', 'note': 75, 'target': False},
        {'inst': 'oboe', 'tech': 'normal', 'dynamic': 'mf', 'note': 79, 'target': False},
        {'inst': 'oboe', 'tech': 'normal', 'dynamic': 'mf', 'note': 82, 'target': False},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'mf', 'note': 63, 'target': False},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'mf', 'note': 67, 'target': False},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'mf', 'note': 70, 'target': False},
        {'inst': 'horn', 'tech': 'normal', 'dynamic': 'mf', 'note': 75, 'target': False},
        {'inst': 'tenor_trombone', 'tech': 'normal', 'dynamic': 'mf', 'note': 63, 'target': False},
        {'inst': 'tenor_trombone', 'tech': 'normal', 'dynamic': 'mf', 'note': 67, 'target': False},
        {'inst': 'bass_trombone', 'tech': 'normal', 'dynamic': 'mf', 'note': 51, 'target': False},
        {'inst': 'bassoon', 'tech': 'normal', 'dynamic': 'mf', 'note': 51, 'target': False},
        {'inst': 'bassoon', 'tech': 'normal', 'dynamic': 'mf', 'note': 39, 'target': False},
        {'inst': 'tuba', 'tech': 'normal', 'dynamic': 'f', 'note': 39, 'target': False},
        {'inst': 'double_bass', 'tech': 'normal', 'dynamic': 'f', 'note': 39, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'f', 'note': 39, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'mf', 'note': 46, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'mf', 'note': 55, 'target': False},
        {'inst': 'cello', 'tech': 'normal', 'dynamic': 'mf', 'note': 63, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 51, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 58, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 67, 'target': False},
        {'inst': 'viola', 'tech': 'normal', 'dynamic': 'mf', 'note': 75, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 58, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 67, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 75, 'target': False},
        {'inst': 'violin', 'tech': 'normal', 'dynamic': 'mf', 'note': 87, 'target': False},
        {'inst': 'tenor_generic', 'tech': 'normal', 'dynamic': 'f', 'note': 67, 'target': True},
    ]
        }
]


instrument_positions=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
def auto_assign_position(name):
    pos = 21
    pos_list = {
        'violin': 2, 'viola': 8, 'cello': 11, 'double_bass': 14, 'flute': 15, 'oboe': 16, 'clarinet': 17, 'bassoon': 18,
        'horn': 19, 'trumpet': 22, 'tenor_trombone': 23, 'bass_trombone': 21, 'timpani': 22, 'cymbal': 24
    }
    if name in list(pos_list.keys()):
        pos = pos_list[name]
    return pos

def transpose(sample, semitones):
    trans = 2 ** (semitones / 12)
    newdata = resample_poly(sample, 44100 / 100, int(44100 * trans / 100))
    return newdata

def cutSample(data):
    fadeamount=300
    maxindex = np.argmax(data>0.01)
    startpos = randint(200,1400)*10+1000
    # data=data[:44100]
    # print('data len :'+str(len(data)))
    if len(data)>44100*3:
        if maxindex>44100:
            if len(data)>maxindex+(44100*3):
                data = data[maxindex-startpos:maxindex-startpos+(44100*3)]
            else :
                data = data[maxindex-startpos:]
        else:
            data = data[0:44100 * 3]
    else:
        if maxindex>44100:
            data = data[maxindex-startpos:]
    #print('data len :'+str(len(data)))
    fade = np.geomspace(1, 2, fadeamount)-1
    data[0:fadeamount]=data[0:fadeamount]*fade
    data[-fadeamount:]=data[-fadeamount:]*np.flip(fade)
    data = np.concatenate((np.zeros(startpos), data), axis=None)
    return data

def fix_length(output, convolved_left, convolved_right):
    if len(output[0]) < len(convolved_left):
        output[0] = np.concatenate((output[0], np.zeros(len(convolved_left) - len(output[0]))), axis=None)
    elif len(output[0]) > len(convolved_left):
        convolved_left = np.concatenate((convolved_left, np.zeros(len(output[0]) - len(convolved_left))),
                                        axis=None)
    if len(output[1]) < len(convolved_right):
        output[1] = np.concatenate((output[1], np.zeros(len(convolved_right) - len(output[1]))), axis=None)
    elif len(output[1]) > len(convolved_right):
        convolved_right = np.concatenate((convolved_right, np.zeros(len(output[1]) - len(convolved_right))),
                                         axis=None)
    output[0] = output[0] + convolved_left
    output[1] = output[1] + convolved_right
    return output

orc=[
     ['flute', 'normal', 'mf', 72, True, True],
     ['trumpet', 'normal', 'mf', 64, False, True],
     ['trumpet', 'normal', 'mf', 72, False, True],
     ['tenor_trombone', 'normal', 'mf', 52, False, True]
 ]
def calculate(ensemble, positions, listening_point):
    point=listening_point
    i = 0
    sr = 44100
    target_sound = [[], []]
    orchestration_sound = [[], []]
    is_target = False
    # print(ensemble)
    for instrument in ensemble:
        instrument = instrument.split(',')
        name = instrument[0]
        tech = instrument[1]
        dyn = instrument[2]
        note = float(instrument[3])
        fraction = note - round(note)
        note = int(round(note))
        if instrument[-1] == 'False' or instrument[-1] == 'false':
            target = False
        else:
            target = True
        # target = instrument[-2]
        try:
            pos = positions[i]
        except:
            pos = auto_assign_position(name)
        # try:
        data, sr = sf.read(instrument_data_path + '/{}/{}/{}/{}.wav'.format(name, tech, dyn, note))
        if len(np.shape(data)) == 2:
            data = data[:, 0]
        if fraction!=0:
            data = transpose(data, fraction)
        data = cutSample(data)
        #print(point)
        ir, sr = sf.read(ir_data_path + '/{}/{}.wav'.format(point, pos))
        ir = np.transpose(ir)
        if i == 0:
            #print('nolla')
            # convolved_left=np.convolve(data, ir[0])
            convolved_left = convolve(data, ir[0])
            print(convolved_left)
            # convolved_right=np.convolve(data, ir[1])
            convolved_right = convolve(data, ir[1])
            output = [convolved_left, convolved_right]
            if target:
                target_sound = [convolved_left, convolved_right]
                is_target = True
                target_max = np.max(target_sound)
            else:
                orchestration_sound = [convolved_left, convolved_right]
        else:
            print('muu: ' + str(instrument))
            print(np.shape(ir))
            print(np.shape(data))
            convolved_left = convolve(data, ir[0])
            convolved_right = convolve(data, ir[1])
            output = fix_length(output, convolved_left, convolved_right)
            # if len(output[0])<len(convolved_left):
            #     output[0]=np.concatenate((output[0], np.zeros(len(convolved_left)-len(output[0]))), axis=None)
            # elif len(output[0])>len(convolved_left):
            #     convolved_left = np.concatenate((convolved_left, np.zeros(len(output[0])-len(convolved_left))), axis=None)
            # if len(output[1])<len(convolved_right):
            #     output[1] = np.concatenate((output[1], np.zeros(len(convolved_right)-len(output[1]))), axis=None)
            # elif len(output[1])>len(convolved_right):
            #     convolved_right = np.concatenate((convolved_right, np.zeros(len(output[1])-len(convolved_right))), axis=None)
            # output[0]=output[0]+convolved_left
            # output[1]=output[1]+convolved_right
            if target:
                if is_target:
                    # target_sound[0] = target_sound[0] + convolved_left
                    # target_sound[1] = target_sound[1] + convolved_right
                    target_sound = fix_length(target_sound, convolved_left, convolved_right)
                    target_max = np.max(target_sound)
                else:
                    target_sound = [convolved_left, convolved_right]
                    is_target = True
                    target_max = np.max(target_sound)
            else:
                if len(orchestration_sound[0]) > 0:
                    orchestration_sound = fix_length(orchestration_sound, convolved_left, convolved_right)
                    # orchestration_sound[0] = orchestration_sound[0] + convolved_left
                    # orchestration_sound[1] = orchestration_sound[1] + convolved_right
                else:
                    orchestration_sound = [convolved_left, convolved_right]
        # except:
        #    return [html.Div('load fail: ' + name)]
        i += 1
    max_l = np.max(output[0])
    max_r = np.max(output[1])
    level = 0
    if max_l < max_r:
        level = max_r
    else:
        level = max_l
    if level >= 0.99:  # 0.99:
        # attenuation= level-0.99
        normalization = 0.99 / level
        print(level)
        print(normalization)
        output[0] = output[0] * normalization
        output[1] = output[1] * normalization
        if is_target:
            target_sound[0] = target_sound[0] * normalization
            target_sound[1] = target_sound[1] * normalization
        if len(orchestration_sound[0]) > 0:
            orchestration_sound[0] = orchestration_sound[0] * normalization
            orchestration_sound[1] = orchestration_sound[1] * normalization
    # print(np.max(output[0]))
    save = io.BytesIO()
    writearray = np.array([output[0], output[1]])
    sf.write(save, np.transpose(writearray), sr, format="wav")
    b64 = base64.b64encode(save.getvalue())
    orchfile = "data:audio/x-wav;base64," + b64.decode("ascii")
    # print(orchfile)
    return Response(orchfile)

@app.route('/community', methods=['GET'])
def return_community_orchestration():
    password = request.headers.get('auth')
    if password == auth:
        try:
            with open('./community/orchestrations.json') as json_file:
                data = json.load(json_file)
            data=list(data)
            return json.dumps(pre_selected_chords+data)
        except:
            return json.dumps(pre_selected_chords)
    else:
        return ''

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

@app.route('/database', methods=['GET'])
def return_orchestration_database():
    password = request.headers.get('auth')
    if password == auth:
        try:
            with open('./no_data_orchestra.pickle', 'rb') as handle:
                orchestra = pickle.load(handle)
            return json.dumps(orchestra, cls=NumpyEncoder)
        except:
            return 'Trouble loading database'
    else:
        return ''

@app.route('/community/add', methods=['POST'])
def add_to_community():
     new_data = str(request.data, 'utf-8')
     new_data = json.loads(new_data)
     password = request.headers.get('auth')
     if password == auth:
         try:
             with open('./community/orchestrations.json') as json_file:
                 data = json.load(json_file)
             with open('./community/backups/orchestrations.json '+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"), 'w') as outfile:
                 json.dump(data, outfile, indent=4)
             data = list(data)
             #print(new_data['orchestration'])
             #print(type(new_data['orchestration']))
             #print(type(data))
             data.append(new_data)
             #print(data)
             with open('./community/orchestrations.json', 'w') as outfile:
                 json.dump(data, outfile, indent=4)
             return "success"
         except:
             return "Something went wrong"
     else:
         return "Error"

@app.route('/posttest', methods=['POST'])
def test_post():
    password = request.headers.get('auth')
    if password == auth:
        return "CORRECT!"
    else:
        return ''

@app.route('/listen', methods=['POST'])
def view_method():
     data = str(request.data, 'utf-8')
     data = json.loads(data)
     password = request.headers.get('auth')
     if password == auth:
         #print(data)
         return calculate(data['orchestration'], data['positions'], data['listeningPosition'])
     else:
         return ''

@app.route('/works', methods=['GET'])
def get_works():
    try:
        with open('./works/works.json') as json_file:
            data = json.load(json_file)
        return data
    except:
        return "Something went wrong"

@app.route('/<piece>/<file>', methods=['GET'])
def load_piece(piece, file):
    def generate_audio():
        with open("./works/{}/{}.mp3".format(piece, piece), "rb") as fwav:
            data = fwav.read(1024)
            while data:
                yield data
                data = fwav.read(1024)
    if file == 'audio':
        return Response(generate_audio(), mimetype="audio/x-mp3")
    if file == 'pdf':
        return send_from_directory(directory='./works/{}'.format(piece),
                           filename='{}.pdf'.format(piece),
                           mimetype='application/pdf')
    if file == 'image':
        try:
            return send_from_directory(directory='./works/{}'.format(piece),
                           filename='{}.jpg'.format(piece),
                           mimetype='image/jpg')
        except:
            return send_from_directory(directory='./works',
                               filename='dummy.jpg',
                               mimetype='image/jpg')
    if file == 'thumb':
        try:
            return send_from_directory(directory='./thumbnails',
                            filename='{}.jpg'.format(piece), mimetype='image/jpg')
        except:
            return send_from_directory(directory='./thumbnails',filename='dummy.jpg',mimetype='image/jpg')
    return ''

@app.route('/maskingSlice', methods=['POST'])
def calculate_masking_slice():
    new_data = str(request.data, 'utf-8')
    new_data = json.loads(new_data)
    print(new_data)
    result = masking_slice.get_slice(new_data, orchestra, multisclice=True)
    print(result)
    return json.dumps(result)

@app.route('/modalSlice', methods=['POST'])
def calculate_modal_slice():
    new_data = str(request.data, 'utf-8')
    new_data = json.loads(new_data)
    print(new_data)
    result = masking_slice.get_slice(new_data, orchestra, multisclice=False)
    # print(result[2]['data'][0])
    # print(result[2]['data'][7])
    result = {"data": result}
    #print(result)
    return json.dumps(result, cls=NumpyEncoder)

@app.route('/compare', methods=['POST'])
def compare_instruments():
    new_data = str(request.data, 'utf-8')
    new_data = json.loads(new_data)
    result = compare_rest.compare(new_data, orchestra)
    return json.dumps(result, cls=NumpyEncoder)

@app.route('/search', methods=['POST'])
def search_instruments():
    new_data = str(request.data, 'utf-8')
    new_data = json.loads(new_data)
    #print(new_data)
    result = timbre_search.press_search(orchestra, new_data[0], new_data[1], new_data[2], new_data[3], new_data[4], new_data[5], new_data[6], new_data[7])
    return json.dumps(result, cls=NumpyEncoder)

if __name__ == '__main__':
    app.run()
