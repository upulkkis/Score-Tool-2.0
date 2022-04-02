import numpy as np
from math import inf, pow, atan, log10, exp, sqrt, floor

def ptp2svp(freq,spl):

    # input
    # freq in Hz
    # spl in dB spl

    # output
    # vPitch : virtual pitches, each row containing freq. (Hz) and salience
    # sPitch : spectral pitches, each row containing freq. (Hz) and salience

    # ptp2svp is a port of C-code into Matlab script.

    # Original Author : Ernst Terhardt 10/06/2004 Version 0.4
    #        ptp2svp
    #        Conversion of part-tone patterns into spectral-virtual-pitch patterns
    #        ---------------------------------------------------------------------
    #        Copyright 1990/2004
    #        Ernst Terhardt, Wengleinstr. 7, D-81477 M•À?nchen/Germany.
    #        http://www.mmk.e-technik.tu-muenchen.de/persons/ter.html
    #        --------------------------------------------------------
    #        This program may be freely used and distributed for any
    #        non-profit purpose.

    # Porter : Matt Flax <flatmax> for the Psy-Sound project flatmaxstudios.com
    # Feb 2007 : http://www.psysound.org

    # debug lines are commented out and included in this version

    # the following options are disabled in this version of the port :
    # shiftflag : option '-t'
    # vplowpass : option '-s'
    # monweight : option '-w'
    # noteflag  : option '-n'
    # nofpitches: option '-p'

    PTMAX =60; #/* size of part-tone arrays */
    SPMAX =20; #/* size of spectral-pitch arrays */
    VPMAX =20; #/* size of virtual-pitch arrays */
    CPMAX =20; #/* size of combined pitch arrays */
    WEIGHTTHRESHOLD=0.1;
    minweight=WEIGHTTHRESHOLD;

    [spp,vpp,cbp]=initialise(SPMAX,VPMAX,CPMAX);

    # set up the input ...
    if len(freq)!=len(spl):
        print('frequency and level vector size mismatch - plesae fix');

    ptp = dict()

    ptp['freq']=np.array(freq)/1e3; # load input into the ptp structure
    ptp['spl']=np.array(spl);
    ptp['count'] = len(freq)-1 #0;
    ptpsubcoincidence=len(freq)-1;

    # ptp=sortptp(ptp);
    # ptp=compfreqlimit(ptp);
    spp=createspp(spp,ptp,SPMAX);
    # print(ptp)
    #dumpSPP(spp);

    [vpp,spp]=subcoincidence(vpp,spp,minweight,VPMAX);
    #dumpVPP(vpp);
    #print(vpp)

    cbp=spsintocombipat(spp,cbp,minweight);

    #dumpCBP(cbp);
    #print(cbp)
    cbp=vpsintocombipat(vpp,cbp,CPMAX);
    #print(cbp)
    sPitch=[];
    vPitch=[];
    # print(cbp)
    if not 'count' in cbp:
        return [sPitch, vPitch]
    for j in range(cbp['count']):
        if cbp['spflg'][j]:
            sPitch=sPitch+[cbp['nomp'][j]*1e3, cbp['weight'][j]]
        else:
            vPitch=vPitch+[cbp['nomp'][j]*1e3, cbp['weight'][j]]
    return [sPitch, vPitch]



# Terhardt's command line output from the original program :
#		for(i=0;i<=cbp['count'] && i<nofpitches;i++) {
#if noteflag printnotename(cbp['nomp'][i]*1000.0);
#else
#	if(!shiftflag)
#		printf("#4.1f ",cbp['nomp'][i]*1000.0);
#	else
#		printf("#4.1f ",cbp['trup'][i]*1000.0);
#}
#printf("#1.2f ",cbp['weight'][i]);
#if(cbp['spflg'][i]) putchar('s');
#else putchar('v');
#putchar('\n');
#}
#printf("#c\n",EODATA);

'''
function dumpSPP(spp)
disp(sprintf('spp['count']=#d\n',spp['count']));
for j=1:spp['count']
    disp(sprintf('spp['freq'][#d]=#f\tspp.shift[#d]=#f\tspp['weight'][#d]=#f\n',j,spp['freq'][j],j,spp.shift[j],j,spp['weight'][j]));
end
end

function dumpVPP(vpp)
disp(sprintf('vpp['count']=#d\n',vpp['count']));
for j=1:vpp['count']
    disp(sprintf('vpp['nomp'][#d]=#f\tvpp['trup'][#d]=#f\tvpp['weight'][#d]=#f\n',j,vpp['nomp'][j],j,vpp['trup'][j],j,vpp['weight'][j]));
end
end

function dumpCBP(cbp)
disp(sprintf('cbp['count']=#d\n',cbp['count']));
for j=1:cbp['count']
    disp(sprintf('cbp['nomp'][#d]=#f\tcbp['trup'][#d]=#f\tcbp['weight'][#d]=#f\tcbp['spflg'][#d]=#f\n',j,cbp['nomp'][j],j,cbp['trup'][j],j,cbp['weight'][j],j,cbp['spflg'][j]));
end
end


function ptp=sortptp(ptp)
temp=[ptp['freq'] ptp['spl']];
temp=sortrows(temp,1);
ptp['freq']=temp(:,1);
ptp['spl']=temp(:,2);
end

function ptp=compfreqlimit(ptp)
if (ptp['count'] > 0)
    i=1;
    while ((i <= ptp['count']) && (ptp['freq'][i] <= 5.0))
        i=i+1;
    end
    ptp['count']=i-1;
end
end

'''

def createspp(spp,ptp,SPMAX):
    i_s=0; #/* index of spp arrays */
    #print(ptp)
    for i in range(ptp['count']+1):
        #       i
        sumlo=1.0E-8; #/* put in a small number to prevent overflow in log */
        j=0;
        while (j<i):
            #         disp('here0');
            s= -24.0-0.23/ptp['freq'][j]+0.2*ptp['spl'][j];
            #disp(sprintf('crutucalbr(#f)=#f\n',ptp['freq'][j],criticalbr(ptp['freq'][j]))); #test the criticalbr function
            #       criticalbr(ptp['freq'][j])
            #       criticalbr(ptp['freq'][i])
            #       ptp['spl'][j]
            Lji = ptp['spl'][j]-s*(criticalbr(ptp['freq'][j])- criticalbr(ptp['freq'][i]));
            sumlo = sumlo+pow(10,(Lji/20.0));
            j=j+1;

        sumhi=1.0E-8;
        j=i+1;
        #      j
        #      i
        while (j<=ptp['count']):
            #    disp(sprintf('ptp['spl']=#f\tother=#f\n',ptp['spl'][j],27.0*(criticalbr(ptp['freq'][j])-criticalbr(ptp['freq'][i]))));
            Lji=ptp['spl'][j]-27.0*(criticalbr(ptp['freq'][j])-criticalbr(ptp['freq'][i]));
            #   disp(sprintf('here1 Lji=#f\n',Lji));
            sumhi=sumhi+pow(10,(Lji/20.0));
            #    disp(sprintf('sumhi=#f\n',sumhi));
            j=j+1;

        #/* Sound pressure level excess of i-th part tone: */
        #disp(sprintf('absthresh(#f)=#f\n',ptp['freq'][i],absthresh(ptp['freq'][i]))); #test the absthresh function
        LXi=ptp['spl'][i]-10.0*log10((sumlo+sumhi)*(sumlo+sumhi) + pow(10,(absthresh(ptp['freq'][i])/10.0)));
        #disp(sprintf('LXi=#f\n',LXi));
        #print(LXi)
        if (LXi > 0.0):
            if (i_s >= SPMAX):
                return spp; #/* This can happen only if SPMAX < 10 */
            else:
                #      disp('here2');
                spp['weight'][i_s]=(1.0-exp(-LXi/15.0))*specweight(ptp['freq'][i]);
                spp['freq'][i_s]=ptp['freq'][i];
                #/* Pitch shift of i-th part tone:   */
                #if (shiftflag) {
                #   LXid=ptp['spl'][i]-20.0*log10(sumlo);
                #   LXidd=ptp['spl'][i]-20.0*log10(sumhi);
                #   spp.shift[is]=2.0E-4*(ptp['spl'][i]-60.0)*(ptp['freq'][i]-2.0) +
                #      1.5E-2*exp(-LXid/20.0)*(3.0-log(ptp['freq'][i]));
                #   spp.shift[is]=spp.shift[is]+3.0E-2*exp(-LXidd/20.0)*(0.36 +
                #      log(ptp['freq'][i]));
                #}
                i_s=i_s+1;

    # OLD ONE spp['count']=i_s-1;
    spp['count'] = i_s ;
    return spp

def absthresh(fkhz):
    return (3.64*(pow(fkhz,-0.8))-6.5*exp(-0.6*(fkhz-3.3)*(fkhz-3.3))+1.0E-3*pow(fkhz,4));



def initialise(SPMAX,VPMAX,CPMAX):
    [spp,vpp,cbp]=clearpitchpatterns(SPMAX,VPMAX,CPMAX);
    vpp['count']= -1;
    spp['count'] = 0;
    cbp['count'] = 0;
    return [spp,vpp,cbp]

def zeros(size, dummy):
    return [0 for i in range(size)]

def clearpitchpatterns(SPMAX,VPMAX,CPMAX):
    spp=dict()
    vpp=dict()
    cbp=dict()
    spp['weight']=zeros(SPMAX,1);
    spp['freq']=zeros(SPMAX,1);
    spp['shift']=zeros(SPMAX,1);
    vpp['weight']=zeros(VPMAX,1);
    vpp['nomp']=zeros(VPMAX,1);
    vpp['trup']=zeros(VPMAX,1);
    cbp['weight']=zeros(CPMAX,1);
    cbp['nomp']=zeros(CPMAX,1);
    cbp['trup']=zeros(CPMAX,1);
    cbp['spflg']=zeros(CPMAX,1);
    return [spp,vpp,cbp]


def vpsintocombipat(vpp,cbp,CPMAX):
    TRUE=1;
    FALSE=0;

    if (vpp['count']<0):
        return [];
    j=0; #/* j = index of virtual pitch array */
    #vpp_count=vpp['count']
    while(j <= vpp['count']):
        #/* if near coincidence and greater weight, replace: */
        r=0; #/* r = index of combipattern array */
        flag=FALSE;
        #   j
        #   r
        #   cbp_count=cbp['count']
        while (not (flag or (r>cbp['count']))):
            if (abs(vpp['nomp'][j]-cbp['nomp'][r])<(0.03*cbp['nomp'][r])):
                flag = TRUE;
                if (vpp['weight'][j]>cbp['weight'][r]):
                    cbp['weight'][r]=vpp['weight'][j];
                    cbp['nomp'][r]=vpp['nomp'][j];
                    cbp['trup'][r]=vpp['trup'][j];
                    cbp['spflg'][r]=FALSE;
                    cbp=sortcombipattern(cbp);
            r=r+1;
        if not flag:
            if (r == CPMAX-1):
                if (vpp['weight'][j] > cbp['weight'][cbp['count']]):
                    cbp['weight'][cbp['count']]=vpp['weight'][j];
                    cbp['nomp'][cbp['count']]=vpp['nomp'][j];
                    cbp['trup'][cbp['count']]=vpp['trup'][j];
                    cbp['spflg'][cbp['count']]=FALSE;
                    cbp=sortcombipattern(cbp);
            else:
                cbp['count']=cbp['count']+1;
                cbp['weight'][cbp['count']]=vpp['weight'][j];
                cbp['nomp'][cbp['count']]=vpp['nomp'][j];
                cbp['trup'][cbp['count']]=vpp['trup'][j];
                cbp['spflg'][cbp['count']]=FALSE;
                cbp=sortcombipattern(cbp);

        j=j+1;
    return cbp


def spsintocombipat(spp,cbp,minweight):
    ic=1;
    TRUE=1; FALSE=0;
    #spp['count']
    for i in range(spp['count']):
        x=0.5*spp['weight'][i];
        if x>=minweight:
            cbp['weight'][ic]=x;
            cbp['nomp'][ic]=spp['freq'][i];
            if not 'count' in spp:
               return;
                    #if (shiftflag)
            #    cbp['trup'](ic)=spp['freq'][i]*(1.0+spp.shift[i]);
            #else
            cbp['trup'][ic]=0.0;
            #end
            cbp['spflg'][ic]=TRUE;
            ic=ic+1;

    cbp['count']=ic-1;
    cbp=sortcombipattern(cbp);
    return cbp


def sortcombipattern(cbp):
    if (cbp['count'] > 0):
        temp=np.array([cbp['weight'], cbp['nomp'], cbp['trup'], cbp['spflg']]);

        temp=-temp;
        # temp=sortrows(temp,1);
        # Find the ordering of the first column (in increasing order)
        #ind = np.argsort(temp[:, 0])

        # Switch the ordering (so it's decreasing order)
        #rind = ind[::-1]
        # Return the matrix with rows in the specified order
        #temp = temp[rind]
        temp = temp[:, temp[0].argsort()]
        temp=-temp;
        temp=temp.transpose()
        cbp['weight']= temp[:,0];
        cbp['nomp']=temp[:,1];
        cbp['trup']=temp[:,2];
        cbp['spflg']=temp[:,3];
        #print(cbp)
    return cbp

def subcoincidence(vpp,spp,minweight,VPMAX):
    #int i, j, m, n;
    #double gam, del, cij, vpw;
    if spp['count'] == 0:
        return [vpp, spp];
    dele=0.08;
    #print(spp)
    for i in range(spp['count']):
        #   i
        for m in range(1,12):#m=1:12
            #       m
            vpw = 0.0;
            if 'count' not in spp:
                return [[], []] #~isfield(spp,'count'); return; end
            for j in range(spp['count']): # j=1:spp['count']
                #           disp(sprintf('here0 j=#d\n',j));
                if (j != i):
                    #               disp('here1');
                    n=floor(m*spp['freq'][j]/spp['freq'][i]+0.5);
                    gam=abs(n*spp['freq'][i]/m /spp['freq'][j]-1.0);
                    if ((gam <= dele) and (n <= 20)):
                        #               disp('here2');
                        cij=sqrt(spp['weight'][i]*spp['weight'][j]/m /n) * (1.0-gam/dele);
                    else:
                        #               disp('here3');
                        cij = 0.0;
                else:
                    #                               disp('here4');
                    cij=0.0;
                vpw=vpw+cij;
            #/* virtual pitch low-pass weighting with 800 Hz cut-off freq.: */
            #if vplowpass
            #                    disp('here5');
            #    #            vpw=vpw/(1.0+pow(spp['freq'][i]/0.8/(double)m, 4.0));
            #    vpw=vpw/(1.0+(spp['freq'][i]/0.8/m)^4);
            #end
            if vpw>=minweight:
                #                               disp('here6');
                vpp=sortintovp(i, m, vpw,vpp,spp,VPMAX);
    return [vpp, spp]

def sortintovp(i, m, vpw,vpp,spp,VPMAX):
    #disp(sprintf('\tenter sortintovp'));
    TRUE=1;
    FALSE=0;
    vnom=spp['freq'][i]/m;
    iv=0;
    pc=FALSE; #/* pc = near coincidence of pitches */
    if vpp['count']>-1:
        while not(pc or (iv > vpp['count']-1)):
            #print(iv)
            #print(vpp['nomp'][iv])
            #disp(sprintf('\tHERE A\n'));
            if (abs(vpp['nomp'][iv]-vnom)<(0.03*vnom)):
                #disp(sprintf('\tHERE B\n'));
                pc=TRUE;     #/* yes, near coincidence */
                #/* if new weight > weight of old coinciding pitch, replace: */

                if(vpw > vpp['weight'][iv+1]):
                  # disp(sprintf('\tHERE C\n'));
                    vpp['weight'][iv+1]= vpw;
                    vpp['nomp'][iv+1]= vnom;
                    #if (shiftflag)
                    #    #disp(sprintf('\tHERE D\n'));
                    #    vpp['trup'](iv)=truvp(vnom, i, m);
                    #end
                    vpp=wsort(vpp);
            iv=iv+1;

    #disp(sprintf('\tHERE E\n'));
    if pc:
        return vpp;

    #disp(sprintf('\tHERE F\n'));
    #/* here comes another, non-coinciding virtual pitch: */
    if (vpp['count'] == VPMAX-1):
        #    disp(sprintf('\tHERE G\n'));
        if (vpw > vpp['weight'][vpp['count']]):
            #        disp(sprintf('\tHERE H\n'));
            vpp['weight'][vpp['count']+1]=vpw;
            vpp['nomp'][vpp['count']+1]=vnom;
            #if(shiftflag)
            #    #            disp(sprintf('\tHERE I\n'));
            #    vpp['trup'](vpp['count']+1)=truvp(vnom, i, m);
            #    vpp=wsort(vpp);
            #end
    else:
        #            disp(sprintf('\tHERE J\n'));
        if vpp['count']==-1:
            vpp['count']=0;
        else:
            vpp['count']=vpp['count']+1;
        vpp['weight'][vpp['count']-1] = vpw;# vpp['weight'][vpp['count']+1]=vpw;
        vpp['nomp'][vpp['count']-1] = vnom;# vpp['nomp'][vpp['count']+1]=vnom;
        #if(shiftflag)
        #    vpp['trup'](vpp['count']+1)=truvp(vnom,i,m);
        #end
        vpp=wsort(vpp);
    return vpp


def wsort(vpp):
    if (vpp['count'] > 0):
        #disp('check this wsort for vpp');

        temp= np.array([vpp['weight'], vpp['nomp'], vpp['trup']]);
        temp[temp==0]=inf # temp(find (temp==0))=inf;
        # temp=sortrows(temp,1);
        # Find the ordering of the first column (in increasing order)
        # ind = np.argsort(temp[:, 0])
        # Switch the ordering (so it's decreasing order)
        # rind = ind[::-1]
        # Return the matrix with rows in the specified order
        # temp = temp[rind]
        temp = temp[:, temp[0].argsort()]

        temp[temp==inf]=0;
        temp=temp.transpose()
        vpp['weight']=temp[:,0];
        vpp['nomp']=temp[:,1];
        vpp['trup']=temp[:,2];
        #disp('END check this wsort for vpp');
    return vpp

def truvp(nomvp, i, m):
    #double x;
    if (nomvp > 0.5):
        output=0;
        return;  #/* for >500Hz true v. pitch is undefined */
    x =1.0E-3*(18.0+2.5*m -(50.0-7.0*m)*nomvp + 0.1/nomvp/nomvp);
    x= -x*signum(m-1);
    x=x+1.0+spp['shift'][i];
    output=nomvp*x;
    return output

# This overloaded function doesn't work with Matlab
def createsppNotUsed(ptp):
    i_s=1; #/* index of spp arrays */

    for i in range(len(ptp['count']+1)): # i=1:ptp['count']+1
        sumlo=1.0E-8; #/* put in a small number to prevent overflow in log */
        j=1;
        while (j<i):
            s= -24.0-0.23/ptp['freq'][j]+0.2*ptp['spl'][j];
            Lji = ptp['spl'][j]-s*(criticalbr(ptp['freq'][j])- criticalbr(ptp['freq'][i]));
            #sumlo = sumlo+pow(10.0, Lji/20.0);
            sumlo = sumlo+pow(10,(Lji/20.0));
            j=j+1;

        sumhi=1.0E-8;
        j=i+1;
        while (j<=ptp['count']+1):
            Lji=ptp['spl'][j]-27.0*(criticalbr(ptp['freq'][j])-criticalbr(ptp['freq'][i]));
            #sumhi=sumhi+pow(10.0, Lji/20.0);
            sumhi=sumhi+pow(10, Lji/20.0) # 10^(Lji/20.0);
            j=j+1;

        #/* Sound pressure level excess of i-th part tone: */
        LXi=ptp['spl'][i]-10.0*log10((sumlo+sumhi)*(sumlo+sumhi) +    pow(10,(absthresh(ptp['freq'][i])/10.0)) );
        if (LXi > 0.0):
            if (i_s >= SPMAX):
                return; # /* This can happen only if SPMAX < 10 */
            else:
                spp['weight'][i_s]=(1.0-exp(-LXi/15.0))*specweight(ptp['freq'][i]);
                spp['freq'][i_s]=ptp['freq'][i];
                #/* Pitch shift of i-th part tone:   */
                #if (shiftflag)
                #    LXid=ptp['spl'][i]-20.0*log10(sumlo);
                #    LXidd=ptp['spl'][i]-20.0*log10(sumhi);
                #    spp.shift(i_s)=2.0E-4*(ptp['spl'][i]-60.0)*(ptp['freq'][i]-2.0) + 1.5E-2*exp(-LXid/20.0)*(3.0-log(ptp['freq'][i]));
                #    spp.shift(i_s)=spp.shift(i_s)+3.0E-2*exp(-LXidd/20.0)*(0.36 + log(ptp['freq'][i]));
                #end
                i_s=i_s+1;

        #spp['count']=i_s-1;
        spp['count']=i_s;
    return spp


def criticalbr(fkhz):
    br=(13.0*atan(0.76*fkhz)+3.5*atan(fkhz*fkhz/56.25));
    return br

def specweight(fkhz):
    expr = fkhz/0.7-0.7/fkhz;
    spw=(1.0/sqrt(1.0+0.07*expr*expr));
    return spw

def signum(n):
    if (n==0):
        sn=(0);
        return sn
    if (n>0):
        sn=(1);
        return sn
    sn=(-1);
    return sn


print(ptp2svp([100,200,300,400, 500, 600, 700], [70,70,70,70, 70, 70, 70]))
print(ptp2svp([400,800,1200,1600, 2000, 2400, 2800], [70,70,70,70, 70, 70, 70]))