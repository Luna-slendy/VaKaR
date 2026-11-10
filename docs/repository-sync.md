# GitHub ↔ Azure Repos sinhronizācija

Repozitoriji:

- GitHub: <https://github.com/Luna-slendy/VaKaR>
- Azure Repos: <https://dev.azure.com/Our0PiA/VaKaR/_git/VaKaR>

Pēc izmaiņu nosūtīšanas GitHub Actions palaiž `.github/workflows/sync-to-azure.yml`,
bet Azure Pipelines — `azure-pipelines.yml`. Abi izsauc `scripts/sync-branch.sh`.
Sinhronizācija pārnes esošos komitus, saglabājot to autorus un SHA identifikatorus.

## Zaru atbilstība

| GitHub | Azure Repos |
| --- | --- |
| `main` | `main` |
| `Vakar-Design` | `feature/site-design` |
| `Dmitrijs-Goncarovs` | `feature/pipeline` |
| `Stepan-hutorovs` | `feature/database` |
| Pārējie zari | Tas pats nosaukums |

Trīs īpašo zaru pāru nosaukumus izmanto tikai attiecīgajā repozitorijā.
Piemēram, GitHub jāstrādā zarā `Dmitrijs-Goncarovs`, bet Azure —
zarā `feature/pipeline`. GitHub zars ar dublējošo nosaukumu `feature/pipeline`
tiek izlaists, lai divi zari nekonkurētu par vienu Azure zaru.

## Sākotnējā iestatīšana

1. GitHub repozitorija slepenajos mainīgajos jāsaglabā `AZURE_DEVOPS_PAT`
   ar Azure DevOps tiesībām **Code: Read & write** šim repozitorijam.
   To izmanto esošā sinhronizācija virzienā GitHub → Azure.
2. Izveido GitHub personiskās piekļuves pilnvaru ar tiesībām nosūtīt izmaiņas
   uz `Luna-slendy/VaKaR`:
   - Īpašnieks `Luna-slendy` var izveidot fine-grained pilnvaru tikai repozitorijam
     `VaKaR` ar tiesībām **Contents: Read and write** un **Workflows: Read and write**.
   - Dalībniekam, kurš uzaicināts cita lietotāja personiskajā repozitorijā,
     jāizmanto classic pilnvara ar tiesībām **repo** un **workflow**.
     Fine-grained pilnvaras vēl neatbalsta rakstīšanu šāda dalībnieka vārdā.
   - Tiesības Workflows ir nepieciešamas izmaiņu pārnešanai mapē `.github/workflows/`.
3. Azure DevOps atver **Pipelines → vajadzīgā konveijera lapa → Edit → Variables**.
   Pievieno `GITHUB_PAT`, ievadi pilnvaras vērtību, ieslēdz **Keep this value secret**
   un saglabā. Pilnvaru glabā iestatījumos; YAML failā ir tikai atsauce uz mainīgo.
4. Konveijerim jāizmanto Azure Repos repozitorijs `VaKaR` un fails
   `/azure-pipelines.yml`. Der esošais konveijers ar šo ceļu; atsevišķs konveijers
   nav jāveido. Ja lietotāja saskarnē ir pārrakstīti CI palaišanas nosacījumi,
   pārslēdz tos uz YAML failā definētajiem nosacījumiem.
5. Saglabā un nosūti konfigurācijas izmaiņas. Iekļauj šos failus zarā `main`
   un visos aktīvajos zaros, kurus nepieciešams sinhronizēt: pakalpojumi lasa
   YAML no tā zara, kurā nosūtītas izmaiņas. Vecākiem izstrādes zariem nepietiek
   ar konfigurāciju tikai zarā `main`.

Mainīgo `deployment_token` turpina izmantot vietnes publicēšanai.
Vietnes būvēšana un publicēšana tiek palaista tikai Azure zarā `main`,
bet sinhronizācija — visos zaros. Šie uzdevumi darbojas neatkarīgi.

## Sākotnējā main vēstures apvienošana

Ja pirms sinhronizācijas ieslēgšanas abos `main` zaros jau ir atsevišķi komiti,
tie vienreiz jāapvieno. Ar YAML failu kopēšanu starp repozitorijiem nepietiek:
kopīgajam komitam jāietver abu pušu vēsture.

Iegūsti aktuālos `origin/main` (Azure) un `github/main` (GitHub). Izveido
atsevišķu zaru no `origin/main` un apvieno tajā `github/main` ar parastu merge.
Pēc konfliktu atrisināšanas nosūti šo zaru uz Azure un izveido izmaiņu
apvienošanas pieprasījumu (pull request) zarā `main`.

Pabeidzot pieprasījumu, izvēlies **Merge (no fast forward)**, lai saglabātu
abas vēstures. Squash izveido jaunu komitu, nesaglabājot GitHub komitus tā
vēsturē, tādēļ sinhronizācija var atkārtoti parādīt `Branches diverged`.

Ja konflikts ir sinhronizācijas konfigurācijā, saglabā aktuālo darbplūsmu,
kas izmanto `scripts/sync-branch.sh`. Divvirzienu sinhronizācijā zaram `main`
jāatbilst otras puses zaram `main`. Iepriekšējais noteikums
`main -> import/github-main` vairs netiek izmantots.

## Aizsardzība pret bezgalīgu ciklu

Skripts pārbauda, vai nosūtāmais komits jau ir mērķa zarā. Ja tā SHA jau ir
atrodams, skripts beidz darbu bez nosūtīšanas un jaunu komitu izveides. Tādēļ
atpakaļsinhronizācija neko nemaina. Arī vecāks rindā esošs uzdevums tiek izlaists,
ja mērķa zars jau ir pavirzījies uz priekšu.

## Neatkarīgas izmaiņas abās pusēs

Ja zaru vēsture atšķiras, sinhronizācija apstājas ar paziņojumu
`Branches diverged`. Apvieno zarus ar parastu merge, atrisini konfliktus un
nosūti kopīgo rezultātu uz vienu no repozitorijiem. Skripts izmanto nosūtīšanu
bez `--force`. Zaru aizsardzības noteikumi paliek spēkā; ja tieša nosūtīšana
ir aizliegta, izmaiņas jāveic ar atļauto apvienošanas pieprasījumu procesu.

Tiek sinhronizēti zaru atjauninājumi. Zaru dzēšana, atzīmes, apvienošanas
pieprasījumi, komentāri un repozitoriju iestatījumi automātiski netiek pārnesti.

## Pārbaude pēc ieslēgšanas

1. Izveido pārbaudes zaru no aktuālā `main` un nosūti vienu komitu uz GitHub.
   Pārliecinies, ka tas pats zars un komita SHA parādās Azure.
2. Pievieno nākamo komitu šajā zarā caur Azure un pārbaudi to pašu SHA GitHub.
3. Atpakaļsinhronizācijai jāizvada `Already synchronized`, neizveidojot jaunu komitu.

Lokālās pārbaudes palaiž ar komandu `python scripts/test_sync_branch.py`.
Tās izmanto pagaidu Git repozitorijus bez piekļuves GitHub un Azure.

## Pakalpojumu dokumentācija

- [Palaišanas nosacījumi un zara YAML fails Azure Repos](https://learn.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git)
- [Apvienošanas pieprasījumu apvienošanas veidi Azure](https://learn.microsoft.com/en-us/azure/devops/repos/git/complete-pull-requests#complete-a-pull-request)
- [Azure Pipelines slepenie mainīgie](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables#secret-variables)
- [GitHub personiskās piekļuves pilnvaras un fine-grained ierobežojumi](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Tiesības mainīt darbplūsmu failus](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents)
