#Constants
import numpy as np
fs=44100
path = 'c:\\samples\\'

Production = False
#instrument_data_path='N:/Score-Tool iowa samples/out'
instrument_data_path = 'c:/sample_database'
#instrument_data_path='/home/uljas/sample_library'
#instrument_data_path='/Users/admin-upu10438/sample_library/sample_library'
#ir_data_path='N:/Score-Tool iowa samples'
ir_data_path = 'c:/sample_database/musatalo'
#ir_data_path='/home/uljas/sample_library/musatalo'
#ir_data_path='/Users/admin-upu10438/sample_library/sample_library/musatalo'

Pref = 2e-5 #Reference sound pressure

threshold = np.array([
    [0, 0, 40],
[86.13,   0.850,  25.87],
[172.27,   1.694,  14.85],
[258.40   ,2.525  ,10.72],
[344.53   ,3.337   ,8.50],
[430.66   ,4.124   ,7.10],
[516.80   ,4.882   ,6.11],
[602.93   ,5.608   ,5.37],
[689.06   ,6.301   ,4.79],
[775.20   ,6.959   ,4.32],
[861.33   ,7.581   ,3.92],
[947.46   ,8.169   ,3.57],
[1033.59   ,8.723   ,3.25],
[1119.73   ,9.244   ,2.95],
[1205.86   ,9.734   ,2.67],
[1291.99  ,10.195   ,2.39],
[1378.13  ,10.629   ,2.11],
[1464.26  ,11.037   ,1.83],
[1550.39  ,11.421   ,1.53],
[1636.52  ,11.783   ,1.23],
[1722.66  ,12.125   ,0.90],
[1808.79  ,12.448   ,0.56],
[1894.92  ,12.753   ,0.21],
[1981.05  ,13.042  ,-0.17],
[2067.19  ,13.317  ,-0.56],
[2153.32  ,13.577  ,-0.96],
[2239.45  ,13.825  ,-1.38],
[2325.59  ,14.062  ,-1.79],
[2411.72  ,14.288  ,-2.21],
[2497.85  ,14.504  ,-2.63],
[2583.98  ,14.711  ,-3.03],
[2670.12  ,14.909  ,-3.41],
[2756.25  ,15.100  ,-3.77],
[2842.38  ,15.283  ,-4.09],
[2928.52  ,15.460  ,-4.37],
[3014.65  ,15.631  ,-4.60],
[3100.78  ,15.795  ,-4.78],
[3186.91  ,15.955  ,-4.91],
[3273.05  ,16.110  ,-4.97],
[3359.18  ,16.260  ,-4.98],
[3445.31  ,16.405  ,-4.92],
[3531.45  ,16.547  ,-4.81],
[3617.58  ,16.685  ,-4.65],
[3703.71  ,16.820  ,-4.43],
[3789.84  ,16.951  ,-4.17],
[3875.98  ,17.079  ,-3.87],
[3962.11  ,17.204  ,-3.54],
[4048.24  ,17.327  ,-3.19],
[4134.38  ,17.447  ,-2.82],
[4306.64  ,17.680  ,-2.06],
[4478.91  ,17.904  ,-1.32],
[4651.17  ,18.121  ,-0.64],
[4823.44  ,18.331  ,-0.04],
[4995.70  ,18.534   ,0.47],
[5167.97  ,18.730   ,0.89],
[5340.23  ,18.922   ,1.23],
[5512.50  ,19.108   ,1.51],
[5684.77  ,19.288   ,1.74],
[5857.03  ,19.464   ,1.93],
[6029.30  ,19.635   ,2.11],
[6201.56  ,19.801   ,2.28],
[6373.83  ,19.963   ,2.46],
[6546.09  ,20.120   ,2.63],
[6718.36  ,20.273   ,2.82],
[6890.63  ,20.421   ,3.03],
[7062.89  ,20.565   ,3.25],
[7235.16  ,20.705   ,3.49],
[7407.42  ,20.840   ,3.74],
[7579.69  ,20.971   ,4.02],
[7751.95  ,21.099   ,4.32],
[7924.22  ,21.222   ,4.64],
[8096.48  ,21.341   ,4.98],
[8268.75  ,21.457   ,5.35],
[8613.28  ,21.676   ,6.15],
[8957.81  ,21.882   ,7.07],
[9302.34  ,22.074   ,8.10],
[9646.88  ,22.253   ,9.25],
[9991.41  ,22.420  ,10.54],
[10335.94  ,22.575  ,11.97],
[10680.47  ,22.721  ,13.56],
[11025.00  ,22.857  ,15.31],
[11369.53  ,22.984  ,17.23],
[11714.06  ,23.102  ,19.34],
[12058.59  ,23.213  ,21.64],
[12403.13  ,23.317  ,24.15],
[12747.66  ,23.414  ,26.88],
[13092.19  ,23.506  ,29.84],
[13436.72  ,23.592  ,33.05],
[13781.25  ,23.673  ,36.52],
[14125.78  ,23.749  ,40.25],
[14470.31  ,23.821  ,44.27],
[14814.84  ,23.888  ,48.59],
[15159.38  ,23.952  ,53.22],
[15503.91  ,24.013  ,58.18],
[15848.44  ,24.070  ,63.49],
[16192.97  ,24.124  ,68.00],
[16537.50  ,24.176  ,68.00],
[16882.03  ,24.225  ,68.00],
[17226.56  ,24.271  ,68.00],
[17571.09  ,24.316  ,68.00],
[17915.63  ,24.358  ,68.00],
[18260.16  ,24.398  ,68.00],
[18604.69  ,24.436  ,68.00],
[18949.22  ,24.473  ,68.00],
[19293.75  ,24.508  ,68.00],
[19638.28  ,24.541  ,68.00],
[19982.81  ,24.573  ,68.00]
])

N = len(threshold[:, 0])
MIN_POWER = -200

barks=[100, 200, 300, 400, 510, 640, 770, 920, 1080, 1270, 1480, 1720, 2000, 2320, 2700, 3150, 3700, 4400, 5300, 6400, 7700, 9500, 12000, 16000];
