# -*- coding: utf-8 -*-

import pandas as pd
from shapely.geometry import Point, shape

from flask import Flask
from flask import render_template
import json


data_path = './input/'


app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/data")
def get_data():
    #df_ponal_2010a2018 = pd.read_csv(data_path + 'df_gen_2010a201820180720-1900.csv')
    df_ponal_2010a2018 = pd.read_csv(data_path + 'df_gen_2010a2018_20180903-2110.csv')
	
    df_reduce = pd.DataFrame()
    df_reduce = df_ponal_2010a2018[['fecha_formato', 'conflictividad', 'edad_9x', 'comuna', 'barrio_nombre', 'sexo', 'anio', 'mes', 'dia', 'hora_24x']]

    df_reduce.comuna = df_reduce.comuna.apply(str)
    df_reduce.comuna = df_reduce.comuna.str.zfill(2)

    df_reduce.mes = df_reduce.mes.replace({1:'Ene', 2:'Feb', 3:'Mar', 4:'Abr', 5:'May', 6:'Jun', 7:'Jul', 8:'Ago', 9:'Sep', 10:'Oct', 11:'Nov', 12:'Dic' })
    
    #df_reduce.hora_24x = df_reduce.hora_24x.replace({1:'12:00am', 2:'01:00am'})

    
    print (df_reduce.comuna.unique())
    
    mask_cali = ((df_reduce.comuna !='23') & 
                 (df_reduce.comuna !='24') & 
                 (df_reduce.comuna !='25') & 
                 (df_reduce.comuna !='26') & 
                 (df_reduce.comuna !='27') &
                 (df_reduce.comuna !='NO REPORTA'))
    df_reduce = df_reduce[mask_cali]
    
    print(df_reduce.head())

    
    
    return df_reduce.to_json(orient='records')

#@app.route("/geojson")
#def get_geojson():
#    with open('./input/geojson/comunas.json') as data_file:
#        data = json.load(data_file)
#        return data

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)