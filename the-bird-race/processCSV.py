import csv
import codecs
import os
import json

# Defien working directory
os.chdir('C:/Users/rnussba1/Documents/GitHub/johnstottbirdingday/the-bird-race')



# Read data
data=[]
with open('MyEBirdData.csv', mode='r', encoding='utf-8-sig') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    for row in csv_reader:
        data.append(row)
        line_count += 1
#print(data)





# Match associate User and checklistid
## Read sublid list
subId_match=[]
with open('subId_match.csv', mode='r', encoding='utf-8-sig') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    for row in csv_reader:
        subId_match.append(row)
        line_count += 1
#print(subId_match)

## Check subId not present in the match list
subId_list_unique=list(set([d['Submission ID'] for d in data]))
subId_list_unique_notin = [s for s in subId_list_unique if s not in [s2['my_subId'] for s2 in subId_match]]
print(subId_list_unique_notin)

## Add user information to data
for d in data:
    s = [s for s in subId_match if s['my_subId']==d['Submission ID']]
    if s:
        d.update(s[0])
    else:
        print(d['Submission ID'])




# Match Taxonomy Category
## Read taxonomy
taxo=[]
with open('eBird_Taxonomy_v2019.csv', mode='r', encoding='utf-8-sig') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    for row in csv_reader:
        taxo.append(row)
        line_count += 1

## Add 
for d in data:
    s = [t for t in taxo if t["TAXON_ORDER"]==d['Taxonomic Order']]
    if s:
        d['category'] = s[0]['CATEGORY']
    else:
        print(d)





# Compute Value

## Species
species_list_sp_only = list(set([d['Common Name'] for d in data if d['category']=="species"]))

## Checklists
checklist_list = []
subId_list = list(set([d['Submission ID'] for d in data]))

for subId in subId_list:
    sightings = [d for d in data if d['Submission ID']==subId]
    checklist={}
    checklist['my_subId'] = sightings[0]['my_subId']
    checklist['State/Province'] = sightings[0]['State/Province']
    checklist['Location ID'] = sightings[0]['Location ID']
    checklist['Latitude'] = sightings[0]['Latitude']
    checklist['Location'] = sightings[0]['Location']
    checklist['Longitude'] = sightings[0]['Longitude']
    checklist['user_id'] = sightings[0]['user_id']
    checklist['user_name'] = sightings[0]['user_name']
    checklist['user_subId'] = sightings[0]['user_subId']
    checklist['Duration'] = sightings[0]['Duration (Min)']
    checklist['number_of_observers'] = sightings[0]['Number of Observers']
    checklist['nb_species'] = len(list(set([d['Common Name'] for d in sightings if d['category']=="species"])))
    checklist['Time'] = sightings[0]['Time']
    checklist_list.append(checklist)


## User
user_list = []
user_name_list = list(set([d['user_name'] for d in data]))

for user_name in user_name_list:
    sightings = [d for d in data if d['user_name']==user_name]
    user={}
    user['user_id'] = sightings[0]['user_id']
    user['user_name'] = sightings[0]['user_name']
    user['checklists'] = list(set([d['user_subId'] for d in sightings]))
    user['nb_species'] = len(list(set([d['Common Name'] for d in sightings if d['category']=="species"])))
    user['number_of_observers'] = max([int(d['Number of Observers']) for d in sightings])
    user['country'] = list(set([d['State/Province'][0:2] for d in sightings]))
    user_list.append(user)




# Export


counter = [ len(species_list_sp_only), sum([int(d['number_of_observers']) for d in user_list]), len(list(set([i for user in user_list for i in user['country'] ]))), sum([int(d['Duration']) for d in checklist_list])/60]

out={}
out['counter']=counter
out['checklist_list'] = checklist_list
out['user_list'] = user_list

with open('out.json', 'w') as outfile:
    json.dump(out, outfile)