"""Rebuild the public user manual from the same French content as the website.
Usage: python3 scripts/generate-pos-manual.py (requires reportlab).
"""
import json
import argparse
from pathlib import Path
from html import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import A4
ROOT = Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Générer un manuel utilisateur Bomoi.')
parser.add_argument('--product',choices=['pos','stock','exchange','erp','stock-client','exchange-pos'],default='pos')
requested=parser.parse_args().product
PRODUCT='stock' if requested=='erp' else requested
IS_POS=PRODUCT=='pos'
NAME={'pos':'Bomoi Stock POS','stock':'Bomoi Stock','exchange':'Bomoi Exchange','stock-client':'Bomoi Stock - Espace client','exchange-pos':'Bomoi Exchange POS'}[PRODUCT]
IS_EXCHANGE=PRODUCT in ('exchange','exchange-pos')
IS_EXCHANGE_POS=PRODUCT=='exchange-pos'
IS_CLIENT=PRODUCT=='stock-client'
DATA = json.loads((ROOT/f'app/manual/{PRODUCT}-manual.fr.json').read_text())
DATA.setdefault('version','1.0')
DATA.setdefault('title','Manuel utilisateur '+NAME)
OUT = ROOT/f'public/documentation/bomoi-{PRODUCT}-manuel-utilisateur.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
BLUE=colors.HexColor('#2463EB'); NAVY=colors.HexColor('#102343'); INK=colors.HexColor('#243650'); MUTED=colors.HexColor('#52647C'); LIGHT=colors.HexColor('#EEF4FF')
W,H=A4
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Chapter',fontName='Helvetica-Bold',fontSize=25,leading=29,textColor=NAVY,spaceAfter=16,keepWithNext=True))
styles.add(ParagraphStyle(name='Intro',fontName='Helvetica',fontSize=11.5,leading=17,textColor=MUTED,spaceAfter=18))
styles.add(ParagraphStyle(name='Copy',fontName='Helvetica',fontSize=10.5,leading=14.5,textColor=INK,spaceAfter=7))
styles.add(ParagraphStyle(name='Step',parent=styles['Copy'],leftIndent=24,firstLineIndent=-24,spaceAfter=10))
styles.add(ParagraphStyle(name='Label',fontName='Helvetica-Bold',fontSize=10,leading=14,textColor=BLUE,spaceBefore=14,spaceAfter=10,keepWithNext=True))
styles.add(ParagraphStyle(name='Issue',fontName='Helvetica-Bold',fontSize=10.5,leading=15,textColor=NAVY,spaceBefore=10,spaceAfter=4,keepWithNext=True))
styles.add(ParagraphStyle(name='Note',parent=styles['Copy'],textColor=MUTED,leftIndent=10,borderColor=colors.HexColor('#C8D9FF'),borderWidth=0,borderPadding=6,spaceAfter=9))
styles.add(ParagraphStyle(name='Eyebrow',fontName='Helvetica-Bold',fontSize=9,leading=13,textColor=BLUE,spaceAfter=10,keepWithNext=True))
def p(text,style='Copy'): return Paragraph(escape(text.replace("⋮", "menu").replace("→", " > ").replace("←", " < ").replace("–", "-").replace("—", "-")),styles[style])
class Manual(SimpleDocTemplate):
 def afterFlowable(self,flowable):
  if isinstance(flowable,Paragraph) and flowable.style.name=='Chapter':
   text=flowable.getPlainText(); key='chapter-'+str(self.seq.nextf('chapter'))
   self.canv.bookmarkPage(key);self.canv.addOutlineEntry(text,key,0,False)
   if text in {section['title'] for section in DATA['sections']}: self.notify('TOCEntry',(0,text,self.page,key))
def cover(c,doc):
 c.saveState();c.setFillColor(NAVY);c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(colors.HexColor('#173C84'));c.circle(W+120,H-180,330,fill=1,stroke=0)
 c.setFillColor(colors.HexColor('#1D4ED8'));c.circle(W+160,H-150,295,fill=1,stroke=0)
 c.drawImage(str(ROOT/'public/bomoi-logo.png'),46,H-190,width=124,height=124,mask='auto')
 c.setFillColor(colors.white);c.setFont('Helvetica-Bold',20);c.drawString(46,H-220,'BOMOI')
 c.setFillColor(colors.HexColor('#A8C8FF'));c.setFont('Helvetica',11);c.drawString(46,H-241,'ERP moderne  /  Multisite  /  Gestion intégrée')
 c.setFillColor(colors.HexColor('#91B7FF'));c.setFont('Helvetica-Bold',10);c.drawString(46,H-320,'MANUEL UTILISATEUR')
 c.setFillColor(colors.white);c.setFont('Helvetica-Bold',32 if IS_CLIENT else 48);c.drawString(43,H-380,NAME if not IS_CLIENT else 'Bomoi Stock');
 if IS_CLIENT:
  c.setFont('Helvetica-Bold',29);c.drawString(46,H-414,'Espace client')
 c.setFont('Helvetica',18);c.drawString(46,H-(448 if IS_CLIENT else 414),'Vos opérations, en toute clarté.' if IS_CLIENT else 'La vente, au rythme du terrain.' if IS_POS else 'Votre bureau de change, au quotidien.' if IS_EXCHANGE else 'Votre entreprise, au quotidien.')
 c.setFillColor(colors.HexColor('#D0DFFF'));c.setFont('Helvetica',12)
 for i,line in enumerate((['Android : téléchargement APK officiel','Commandes. Livraisons. Paiements. Relevés.','Consultation personnelle, avec Internet.'] if IS_CLIENT else ['Android, iPhone et terminaux compatibles','Vendre. Encaisser. Imprimer. Synchroniser.','Guide pratique et dépannage, avec ou sans Internet.'] if IS_POS else ['APK Android : achats et ventes de devises','Enregistrer. Imprimer. Synchroniser.','Guide pratique avec et sans Internet.'] if IS_EXCHANGE_POS else ['Application web pour le bureau de change','Devises. Caisses. Valorisation. Partenaires.','Guide pratique et résolution des incidents.'] if IS_EXCHANGE else ['Application web de gestion intégrée','Stocks. Ventes. Achats. Caisses. Rapports.','Guide pratique et résolution des incidents.'])): c.drawString(46,H-(495 if IS_CLIENT else 467)-i*22,line)
 c.setStrokeColor(colors.HexColor('#45628C'));c.line(46,235,W-46,235)
 c.setFillColor(colors.white);c.setFont('Helvetica-Bold',12);c.drawString(46,208,'Bomoi - Gestion intégrée des entreprises')
 c.setFont('Helvetica',10);c.setFillColor(colors.HexColor('#D0DFFF'))
 for y,line in [(188,'Stocks, ventes, achats, finances et opérations multisites.'),(157,'Kinshasa, République démocratique du Congo'),(137,'contact@bomoi.cd  |  +243 981 863 765'),(117,'https://bomoi.cd'),(70,'Édition du '+DATA['edition']+'  |  Version '+DATA['version']+'  |  Français')]: c.drawString(46,y,line)
 c.linkURL('https://bomoi.cd',(46,110,190,128),relative=0)
 c.restoreState()
def running(c,doc):
 c.saveState();c.setStrokeColor(colors.HexColor('#DCE6F4'));c.line(46,H-46,W-46,H-46)
 c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawString(46,H-34,NAME.upper()+'  /  MANUEL UTILISATEUR');c.drawRightString(W-46,H-34,'Édition '+DATA['version'])
 c.line(46,43,W-46,43);c.drawString(46,28,'bomoi.cd  |  contact@bomoi.cd');c.drawRightString(W-46,28,str(doc.page))
 c.restoreState()
story=[Spacer(1,1),PageBreak(),p('Votre guide personnel' if IS_CLIENT else 'Votre guide de terrain' if IS_POS or IS_EXCHANGE_POS else 'Votre guide de gestion','Chapter'),p('Ce manuel accompagne les clients de Bomoi Stock dans la consultation de leurs documents, comptes et relevés. Il décrit la connexion, le profil et les réglages disponibles dans l’application mobile.' if IS_CLIENT else 'Ce manuel s’adresse aux vendeurs, agents et responsables qui utilisent Bomoi Stock POS. Les procédures décrivent les commandes visibles dans l’application et les démarches à suivre auprès du responsable en cas de blocage.' if IS_POS else 'Ce manuel décrit Bomoi Exchange POS sur Android : connexion, achats et ventes de devises, reçus, travail hors ligne, synchronisation et traitement des conflits.' if IS_EXCHANGE_POS else 'Ce manuel accompagne les agents et responsables du bureau de change : préparation, achats et ventes de devises, caisses, valorisation CDF, partenaires et rapports.' if IS_EXCHANGE else 'Ce manuel accompagne les utilisateurs de Bomoi Stock dans leurs opérations sur le web. Il présente les principaux parcours de consultation, de vente et de gestion des stocks, ainsi que les démarches à suivre en cas de blocage.','Intro'),p('Lecture rapide','Label'),p('Pour commencer : chapitres 1 à 3. Pour suivre vos opérations : chapitres 4 à 7. Pour comprendre vos soldes : chapitres 8 et 9. Photo, apparence, notifications, sécurité et aide : chapitres 10 à 14.' if IS_CLIENT else 'Pour démarrer : chapitres 1 à 3. Pour réaliser une vente : chapitres 4 à 10. Pour le travail hors ligne et les contrôles : chapitres 11 à 15. Pour les réglages et incidents : chapitres 16 à 20.' if IS_POS else 'Installation et connexion : chapitres 1 et 2. Cotation, achats et ventes : chapitres 3 à 5. Historique, hors ligne, synchronisation et conflits : chapitres 6 à 9. Caisse, impression et assistance : chapitres 10 à 12.' if IS_EXCHANGE_POS else 'Pour préparer le bureau : chapitres 1 à 9. Pour les achats et ventes : chapitres 10 à 12. Partenaires et caisses : chapitres 13 à 16. Valorisation, rapports et incidents : chapitres 17 à 21.' if IS_EXCHANGE else 'Pour commencer : chapitres 1 à 3. Stocks et inventaires : chapitres 4 à 6. Ventes, paiements et achats : chapitres 7 à 9. Caisses, conflits POS, rapports et personnalisation : chapitres 10 à 13.'),p('Vos informations personnelles' if IS_CLIENT else 'Conservez vos opérations','Label'),p('Vérifiez l’entreprise et la devise du compte. Les opérations annulées ne sont pas visibles. Pour une correction ou une explication, contactez votre entreprise avec la référence du document. Cet espace ne permet pas de modifier les opérations financières.' if IS_CLIENT else 'Une vente enregistrée ne doit pas être recréée à cause d’une impression ou d’une synchronisation en échec. Vérifiez toujours l’Historique. Ne désinstallez pas l’application et n’effacez pas ses données tant que des ventes restent à transmettre.' if IS_POS else 'Avant de ressaisir un achat ou une vente après une réponse perdue, recherchez l’opération et vérifiez son état. Ne remettez et n’encaissez jamais une seconde fois les fonds pour résoudre un problème d’impression.' if IS_EXCHANGE else 'Avant de ressaisir une opération après une erreur, vérifiez sa présence dans la liste et consultez son état. Pour une vente mobile en conflit, corrigez la cause et conservez la vente d’origine, sans encaisser le client une seconde fois.'),p('Documentation en ligne','Label'),Paragraph(f'<link href="https://bomoi.cd/documentation/bomoi-{PRODUCT}" color="#2463EB">bomoi.cd/documentation/bomoi-{PRODUCT}</link>',styles['Copy']),p('Les rubriques et options disponibles dépendent des autorisations de votre entreprise. Pour toute correction de vos coordonnées ou explication d’une opération, contactez votre entreprise.' if IS_CLIENT else 'Les droits, devises, formats de papier et options disponibles dépendent de la configuration de votre entreprise. Certaines commandes peuvent être absentes de votre appareil. Le responsable habilité est votre premier interlocuteur pour les corrections dans le web.'),PageBreak(),p('Sommaire','Chapter')]
toc=TableOfContents();toc.levelStyles=[ParagraphStyle(name='Toc',fontName='Helvetica',fontSize=10,leading=14,textColor=INK,spaceBefore=4,leftIndent=0,rightIndent=20)]
story.extend([toc,PageBreak()])
for index,section in enumerate(DATA['sections'],1):
 story.extend([p('CHAPITRE '+str(index).zfill(2),'Eyebrow'),p(section['title'],'Chapter'),p(section['intro'],'Intro')])
 if section['steps']:
  story.append(p('COMMENT FAIRE','Label'))
  for n,step in enumerate(section['steps'],1): story.append(p(str(n).zfill(2)+'   '+step,'Step'))
 if section['notes']:
  story.append(p('À RETENIR','Label'))
  for note in section['notes']:story.append(p(note,'Note'))
 if section['issues']:
  story.append(p('SITUATIONS ET SOLUTIONS','Label'))
  for issue in section['issues']: story.extend([p(issue['problem'],'Issue'),p(issue['action'])])
 if index<len(DATA['sections']):story.append(PageBreak())
doc=Manual(str(OUT),pagesize=A4,rightMargin=46,leftMargin=46,topMargin=68,bottomMargin=62,title=DATA['title'],author='Bomoi',subject='Guide utilisateur et dépannage '+NAME)
doc.multiBuild(story,onFirstPage=cover,onLaterPages=running)
if PRODUCT == 'stock':
 import shutil
 shutil.copyfile(OUT, ROOT/'public/documentation/bomoi-erp-manuel-utilisateur.pdf')
print(OUT)
