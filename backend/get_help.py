'''
import dash_html_components as html
import dash_admin_components as dac

def general():
    return html.Div([
        html.Div('This is a web app targeted to composers, conductors, musicians and musicologists interested in orchestration. '),
        html.Br(),
        html.Div('The main focus of the app is on masking and blending properties of the music.'),
        #html.Br(),
        #html.Div('The on important icon on the top right corner is the clipboard icon:'),dac.Icon(icon='clipboard'),
        #html.Div('it holds your current orchestration with edit properties in all cases.'),
        html.Br(),
        html.Div('Try first to open the chord app:'), dac.Icon(icon='edit'),
        html.Div('Add a few instruments, set one as target and see wheter your target instrument is audible or not. Modify then your orchestration by clickin the `Click to check or modify your orchestration` -button, and see the changes in graphs.')
    ])

def help(topic='No help yet :('):
    if topic=='single_start':
        text= 'Press ´add instruments´ to add instruments to your orchestration. For each instrument you can select technique, dynamics and note. You can also temporarely switch instrument on or off to see the effect in analysis.'
    if topic=='single_analyze':
        text= 'After setting the instrumentation press ´Analyze´ to calculate masking and sound-color analysis of your instrumentation.'
    if topic=='single_masking':
        text = 'here you see the masking graph. X axis is frequency, and y axis is decibels. The colored area represents the masking are, i.e. ehre the sound of orchestration masks other sounds'
    if topic=='single_features':
        text = 'Centroid means the center of balance in sound. The higher centroid means brighter sound, and brighter sound tends to be more audible than dasrk sound. Mfcc is a mathematical representation of sound color regardless the pitch. Mfcc distance thus means how far apart the target and the orchestration sound colors are. Variation coefficient measures the homogenuity of the orchestration, lower value means more homogenous sound.'
    if topic=='mfcc_vector':
        text = 'Mfcc vector is a graphical representation of the sound colors of target and orchestration. The grey area shows the difference. More grey means that the target sound color is further apart from the orchestration sound color.'
    if topic=='general':
        text= general()
    return html.Div(text)
'''