Hey, thanks for the Gombe PR — the Governor, Senators, Reps, and all 24 Assembly members are solid, genuinely great work.

One thing needs fixing before I can merge it: the Chairman section has 2-3 different names listed for several LGAs (e.g. Akko has three: Abubakar Usman Barambu, Garba Yakubu Wali, and Bello Suleiman). A Chairman governs the whole LGA — there's only ONE per LGA, not one per state assembly seat within it. I think the extra names might be from state constituency-level sources and got mixed in with the actual LGA Chairman research.

Can you confirm which ONE name is the actual sitting Chairman for each of these 11 LGAs: Akko, Balanga, Billiri, Dukku, Funakaye, Gombe, Kaltungo, Kwami, Nafada, Shongom, and Yamaltu/Deba? Once I have that, I'll merge it in.

Also, small thing: use "source": "manual" instead of your name in that field going forward — that field tracks HOW the data was sourced (wikidata vs manual research), not who submitted it.





ANAMBRA
Oyi's assembly seat has two conflicting names — Innocent Ojike (APGA) and Charles Chinedu Obimma (YPP). Only one seat exists there; neither is included yet.
An entry labeled "Anambra Central" (Emeka Egbuonu, APGA) doesn't match any real assembly seat — Anambra Central is a senatorial district name, not a constituency. All 30 real seats are already accounted for without him, so this looks like a stray duplicate — worth asking directly where he actually belongs rather than guessing.



BAUCHI
Hey, thanks for the Bauchi data — I merged it but found a few issues while cleaning up the JSON that I think need your eyes since they're data calls, not just formatting:

1. Duplicate HOA entry: "Hamza Sa'id" is listed twice for the same state constituency, once as "Jama'a/Toro" and once as "Toro/Jama'a" (just reversed). Looks like one entry got duplicated — can you confirm which name/spelling is correct and I'll remove the dupe?

2. "Udubo" has a House of Assembly rep listed (Ahmed Muhammad Lele) but there's no matching state constituency for it anywhere else in the data. Is Udubo its own constituency, or is it part of one of the other named ones?

3. A bunch of the top-level state constituency names don't match how they're spelled everywhere else in the file — e.g. "kirfi State Constituency" (lowercase) vs "Kirfi" used elsewhere, "Azare State Constituency" vs "Azare/Madangala", "Katagum State Constituency" vs "katagum/Azare", "Ganjuwa East"/"Ganjuwa west" vs plain "Ganjuwa". Can you double check these against your source and let me know the correct spelling for each so they're consistent?

4. Same thing with federal constituency names — the top list says "Dorozo/Ganjuwa", "Ning/Warji", and "Shira/Glade", but everywhere else in the file (LGAs, reps) spells them "Darazo/Ganjuwa", "Ningi/Warji", and "Shira/Giade". Pretty sure the top list has the typos here, but wanted to confirm before I change it.

5. Misau and Tafawa Balewa LGAs both reference a state constituency that doesn't appear anywhere in the top-level list. Can you send the correct constituency name for each?

Once you confirm these I'll make the fixes and push. No rush, just wanted to flag before this data goes live since it affects lookups across the file.