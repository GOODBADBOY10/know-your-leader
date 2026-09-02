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




JIGAWA
Hey, thanks for the Jigawa data — solid overall, best one yet actually. Merged it, but a few things I want to flag before they go live:

1. You put the LGA chairmen in a separate "lgaChairmen" array instead of inside "officeholders" with "office": "CHM", which is how every other state file does it (Kwara, Abia, Bauchi, etc.). I moved them into "officeholders" to match so they don't end up invisible if the app only reads from "officeholders" — just flagging in case there's a reason you split them out that I'm missing.

2. Three state constituencies — Bulangu, Fagam, and Kanya — have House of Assembly reps listed, but none of the LGA entries reference them. My guess is Birnin Kudu, Dutse, and Kiyawa each actually split into two state constituencies (like some LGAs do in other states), but I didn't want to guess which LGA pairs with which. Can you confirm the LGA-to-constituency mapping for those three?

3. Three chairmen entries (Jahun, Kafin Hausa, Kiri Kasamma) have the name field literally set to "Chairman listed in 2024 state records" instead of an actual name — looks like a placeholder that didn't get swapped out. Can you send the real names?

Everything else checked out clean — all 27 LGAs have chairmen, all 11 federal constituencies have reps, no duplicate entries. Once you send over the fixes for 2 and 3 I'll patch and push.



ABIA
Hey, thanks for the Abia data — merged it, but found a few things that need your eyes since they're data calls, not just formatting:

1. The LGA entries and one federal rep record use "Abia North" and "Abia South" as LGA names (e.g. federalConstituency "Abia North/Aba South Federal Constituency", stateConstituency "Abia North State Constituency"). Real Abia LGAs are "Aba North" and "Aba South" — and further down in the same file, the CHM (chairman) entries for those two LGAs are spelled correctly as "Aba North"/"Aba South". Looks like a typo that snuck into just those specific records. Can you confirm and I'll fix it everywhere it appears?

2. "Isuikwuato State Constituency" is listed twice in the top-level stateConstituencies array. Is that a genuine duplicate, or are there actually two different constituencies that happen to share the name?

3. A couple of naming mismatches between the top-level stateConstituencies list and what's referenced elsewhere in the file: "Umuahia East State Constituency" is used by an LGA and has an HOA rep, but doesn't appear in the top-level list at all. And the top-level list has "Aba North constituency" (lowercase, no "State") while the HOA rep for that seat references "Aba North State Constituency" instead. Can you confirm the correct/final names for these two?

Once you confirm, I'll make the fixes and push. No rush — just wanted to flag before this data goes live since it affects lookups across the file.


BORNO
Hi, thanks for the Borno data — I merged it in and cleaned up some JSON formatting issues on my end. One thing I couldn't fix myself and need your help with: the federalConstituencies list at the top of the file doesn't match what's referenced inside individual LGA entries further down. For example:

Top list says "Dikwa/Mafa/Konduga Federal Constituency", but Dikwa's entry references "Dikwa/Mafa/Ngozala Federal Constituency"
Top list says "Kaga/Gubio/Magumeri Federal Constituency", but Gubio's entry references "Kaga/Gubio/Bade Federal Constituency"
Similar mismatches for Guzamala, Konduga, Kukawa, Mafa, Ngala, and Maiduguri

Could you double-check which naming is correct and let me know? I don't want to guess and put wrong constituency names into the dataset. Once confirmed I'll update the file.


ANAMBRA
Hey, thanks for the Anambra PR — genuinely one of the best submissions so far. Governor, all 3 Senators, all 11 Reps, and all 21 Chairmen (correctly one per LGA) are solid and already merged in.

Two small things need clearing up before I mark the state fully verified:

1. Oyi's state assembly seat has two different names attached — Innocent Ojike (APGA) and Charles Chinedu Obimma (YPP). Oyi only has one seat, so these can't both be right. Which one is the actual sitting member?

2. There's an entry for "Anambra Central" with Emeka Egbuonu (APGA) as an Assembly member, but Anambra Central isn't a state constituency — it's one of the 3 senatorial districts. All 30 real assembly seats are already accounted for without this entry, so I think it might be a duplicate or mislabeled. Do you know which actual constituency Emeka Egbuonu represents, if any?

Also, small note: a few of your Senators/Reps show "NDC" as their party where they were historically known under other parties (e.g. Victor Umeh, usually APGA). That's plausible given the wave of defections this year, but I haven't independently reverified it — if you have a source confirming the current party for those, that'd help lock it in.

Once I hear back on the two seat questions, I'll add them in and mark Anambra done. Great work overall.



