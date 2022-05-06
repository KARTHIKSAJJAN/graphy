from flask import Flask, render_template, Response
import numpy as np
import boto3
import cv2
import sys
import json

start = False
globalFrame = None
services = boto3.client("textract")
app = Flask(__name__)
@app.route('/')
def index():
    return render_template("index.html")
@app.route('/startRecognising')
def startRecognising():
    global start
    while not start:
        pass
    return Response(generate_frames(),mimetype='multipart/x-mixed-replace; boundary=frame')
def generate_frames():
    global start
    global globalFrame
    vs = cv2.VideoCapture(0)
    while(vs.isOpened()):
        ok, frame = vs.read()
        if ok:
            globalFrame = frame
            ret,buffer=cv2.imencode('.jpg',frame)
            frame=buffer.tobytes()
            yield(b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            if not start:
                vs.release()
                while True:
                    if not start:
                        pass
                    else:
                        vs = cv2.VideoCapture(0)
                        break
    return 'Success'
@app.route('/setStart')
def setStart():
    global start
    start = True
    return 'Success'
@app.route('/stopStart')
def stopStart():
    global start
    global globalFrame
    resultString = ""
    start = False
    cv2.imwrite("frame.jpg",globalFrame)
    with open('frame.jpg', 'rb') as document:
        img = bytearray(document.read())
    response = services.detect_document_text(Document={"Bytes": img})
    for item in response["Blocks"]:
        if item["BlockType"] == "LINE":
            resultString = resultString + item["Text"]
    single = []
    for i in resultString:
        single.append(i)
    single = list(filter(lambda a: a != ' ', single))
    sup_scrps = dict({'\u2070':'0', '\u00B9':'1', '\u00B2':'2', '\u00B3':'3', '\u2074':'4', '\u2075':'5', '\u2076':'6', '\u2077':'7', '\u2078':'8', '\u2079':'9'})
    number_list = [ str(x) for x in range(1, 10)]
    sample1 = single.copy()
    k = 0
    for i in range(len(single)):
        for key in sup_scrps:
            if single[i]==key:
                sample1[i]=sup_scrps[key]
                sample1.insert(i, '^')
                k = k + 1
        if i == len(single)-1:
            break
        if 'x'==single[i] and single[i+1] in number_list:
            sample1.insert(i+1+k, '^')
            k = k+1
    resultString = "".join(map(str, sample1))
    data = {}
    data['result'] = resultString
    print(resultString)
    return json.dumps(data)
if __name__ == '__main__':
    app.run()
