from flask import Flask, render_template, request
import boto3
import json
import base64
import io
from PIL import Image

services = boto3.client("textract")
app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/recognise', methods=['POST'])
def recognise():
    imageData = request.get_json().get('imageData')
    imageData = bytes(imageData[23:], 'utf-8')
    im = Image.open(io.BytesIO(base64.b64decode(imageData))).save('frame.jpeg')
    with open('frame.jpeg', 'rb') as document:
        img = bytearray(document.read())
    resultString = ""
    response = services.detect_document_text(Document={"Bytes": img})
    for item in response["Blocks"]:
        if item["BlockType"] == "LINE":
            resultString = resultString + item["Text"]
    print(resultString)
    single = []
    for i in resultString:
        single.append(i)
    single = list(filter(lambda a: a != ' ', single))
    sup_scrps = dict({'\u2070':'0', '\u00B9':'1', '\u00B2':'2', '\u00B3':'3', '\u2074':'4', '\u2075':'5', '\u2076':'6', '\u2077':'7', '\u2078':'8', '\u2079':'9'})
    number_list = [str(x) for x in range(1, 10)]
    sample1 = single.copy()
    k = 0
    for i in range(len(single)):
        for key in sup_scrps:
            if single[i]==key:
                sample1[i]=sup_scrps[key]
                sample1.insert(i, '^')
                k = k + 1
            if single[i]=='o':
                sample1[i+k]='0'
        if i == len(single)-1:
            break
        if 'x'==single[i] and single[i+1] in number_list:
            sample1.insert(i+1+k, '^')
            k = k+1
    resultString = "".join(map(str, sample1))
    print(resultString)
    data = {}
    data['result'] = resultString
    return json.dumps(data)

if __name__ == '__main__':
    app.run()
