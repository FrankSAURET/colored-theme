#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Exemple Python / MicroPython : tous les éléments de syntaxe à colorer.

Ouvrir avec chacun des thèmes Colored Theme pour vérifier les couleurs.
"""

# --- Imports -------------------------------------------------------------
import re
import uasyncio as asyncio
from machine import Pin, PWM, I2C, ADC
from micropython import const
from typing import Optional, List, Dict

try:
	import utime as time
except ImportError:
	import time

# --- Constantes et littéraux -------------------------------------------
LED_PIN = const(25)
FREQUENCE: int = 1_000
REEL = 3.14
EXPOSANT = 1.5e-3
HEXA = 0xFF
BINAIRE = 0b1010
OCTAL = 0o755
COMPLEXE = 2 + 3j
RIEN = None
VRAI, FAUX = True, False
POINTS = ...

simple = 'apostrophes'
double = "guillemets\t\"échappés\"\n"
brut = r"C:\chemin\sans\échappement"
octets = b"\x00\x01\xff"
multi = """Chaîne
sur plusieurs lignes"""
motif = re.compile(r"^(\d{2,4})-[a-z]+\s*$")
nom = "Pico"
tension = 3.3
gabarit_f = f"Carte {nom!r} : {tension:.2f} V, {{accolades}}"
gabarit_pct = "%s vaut %d" % (nom, 42)
gabarit_fmt = "{0} et {nom}".format(1, nom=nom)


# --- Décorateurs, classes et méthodes ---------------------------------
def journal(fonction):
	"""Décorateur simple."""
	def enveloppe(*args, **kwargs):
		print("Appel de", fonction.__name__)
		return fonction(*args, **kwargs)
	return enveloppe


class Capteur:
	"""Classe de base d'un capteur."""
	compteur: int = 0

	def __init__(self, broche: int, nom: str = "capteur") -> None:
		self.broche = ADC(Pin(broche))
		self._nom = nom
		Capteur.compteur += 1

	def __repr__(self) -> str:
		return f"<Capteur {self._nom}>"

	@property
	def nom(self) -> str:
		return self._nom

	@staticmethod
	def convertir(brut: int) -> float:
		return brut * 3.3 / 65535

	@classmethod
	def creer(cls, broche):
		return cls(broche)

	def lire(self) -> float:
		raise NotImplementedError("À redéfinir")


class Thermometre(Capteur):
	def __init__(self, broche, seuil: Optional[float] = None):
		super().__init__(broche, nom="thermo")
		self.seuil = seuil

	@journal
	def lire(self) -> float:
		valeur = self.convertir(self.broche.read_u16())
		return 27 - (valeur - 0.706) / 0.001721


# --- Fonctions MicroPython ------------------------------------------------
led = Pin(LED_PIN, Pin.OUT)
pwm = PWM(Pin(15), freq=FREQUENCE)
i2c = I2C(0, scl=Pin(1), sda=Pin(0), freq=400_000)


def sur_appui(broche):
	global FREQUENCE
	FREQUENCE = FREQUENCE * 2 if FREQUENCE < 8000 else 1000


bouton = Pin(14, Pin.IN, Pin.PULL_UP)
bouton.irq(trigger=Pin.IRQ_FALLING, handler=sur_appui)


@micropython.native
def calcul_rapide(n: int) -> int:
	total = 0
	for i in range(n):
		total += i ** 2 // 3 % 7
	return total


async def clignoter(periode_ms: int = 500):
	while True:
		led.toggle()
		await asyncio.sleep_ms(periode_ms)


def compteur_externe():
	n = 0
	def suivant():
		nonlocal n
		n += 1
		return n
	return suivant


def generateur(limite):
	yield from range(limite)
	yield limite


# --- Opérateurs et expressions -------------------------------------------
a, b = 7, 3
calcul = (a + b) * a - b / a // b % 2 ** 3
calcul += 1; calcul -= 1; calcul *= 2; calcul /= 2
bits = (a & b) | (a ^ b) | ~a << 2 >> 1
logique = a > b and not a == b or a != b and b <= a >= b
appartient = 3 in [1, 2, 3] and RIEN is None and 4 not in (1, 2)
if (taille := len(nom)) > 3:
	print(taille, end="\n", sep=" ")
carre = lambda x: x * x
liste: List[int] = [x * 2 for x in range(10) if x % 2 == 0]
dico: Dict[str, int] = {"a": 1, "b": 2, **{"c": 3}}
ensemble = {1, 2, 3}
tranche = liste[1:5:2]
premier, *reste = liste
matrice = [[1, 0], [0, 1]]


# --- Structures de contrôle ------------------------------------------------
def principal():
	capteur = Thermometre(4, seuil=30.0)
	assert isinstance(capteur, Capteur), "Type inattendu"
	with open("journal.txt", "w") as fichier:
		fichier.write(str(capteur.lire()))
	try:
		resultat = int("abc")
	except (ValueError, TypeError) as erreur:
		print("Erreur :", erreur)
		resultat = -1
	else:
		pass
	finally:
		del capteur

	match resultat:
		case 0:
			print("zéro")
		case -1 | -2:
			print("négatif")
		case _:
			print("autre")

	i = 0
	while i < 10:
		i += 1
		if i == 3:
			continue
		elif i > 8:
			break
	else:
		print("fin de boucle")
	return resultat


if __name__ == "__main__":
	principal()
	asyncio.run(clignoter())
