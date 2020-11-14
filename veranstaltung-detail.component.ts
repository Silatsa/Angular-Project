import { Component, OnInit } from '@angular/core';
import { Veranstaltung } from 'src/app/shared/models/Veranstaltung';
import { VeranstaltungService } from 'src/app/services/veranstaltung.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { BenutzerService } from 'src/app/services/benutzer.service';
import { Loginservice } from 'src/app/services/login.service';

@Component({
  selector: 'app-veranstaltung-detail',
  templateUrl: './veranstaltung-detail.component.html',
  styleUrls: ['./veranstaltung-detail.component.scss']
})
export class VeranstaltungDetailComponent implements OnInit {
  public veranstaltung: Veranstaltung = new Veranstaltung();
  panels: Array<{ active: boolean, name: string, disabled: boolean, value: string }>;
  id?: number;
  public isPdfLinkVisible: boolean = false;
  constructor(
    protected veranstaltungService: VeranstaltungService,
    protected benutzerService: BenutzerService,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    private loginService: Loginservice) {
  }

  ngOnInit() {
    this.loginService.isLoggedInInteressent().then(x => {
      if (x !== null && x.veranstaltungenImWarenkorb.length > 0) {
        sessionStorage.setItem("LoggedInUser", x.email);
        sessionStorage.setItem('Warenkorb', 'Nicht_Leer');
      } else if (x !== null) {
        sessionStorage.setItem("LoggedInUser", x.email);
        sessionStorage.setItem('Warenkorb', 'Leer');
      }
      else {
        sessionStorage.removeItem("LoggedInUser");
        sessionStorage.removeItem("Warenkorb");
      }
    });
    this.activatedRoute.paramMap.subscribe(params => {
      if (!params.get("id")) {
        return;
      }
      this.id = parseInt(params.get("id"));
      this.veranstaltungService.get(this.id).then(x => {
        this.veranstaltung = x;
        var tempString = this.veranstaltung.seminarNr.replace(" ", "");
        let parsedSemNr = tempString.replace("/", "-");
        this.veranstaltungService.checkForPdf(parsedSemNr).then(x => {
          this.isPdfLinkVisible = x;
        }).catch(e => {
          console.error(e);
        });
          this.panels = [];
        if (this.veranstaltung.langbeschreibung !== null && !!this.veranstaltung.langbeschreibung.replace(/<[^>]*>|\s+/g, '')) {
          this.panels.push({
            active: false,
            name: 'Ausführliche Beschreibung',
            disabled: false,
            value: this.veranstaltung.langbeschreibung
          })
        }
        if (this.veranstaltung.zielgruppe !== null && this.veranstaltung.zielgruppe.replace(/<[^>]*>|\s+/g, '')) {
          this.panels.push({
            active: false,
            name: 'Zielgruppe',
            disabled: false,
            value: this.veranstaltung.zielgruppe
          })
        }
        if (this.veranstaltung.voraussetzungen && !!this.veranstaltung.voraussetzungen.replace(/<[^>]*>|\s+/g, '')) {
          this.panels.push({
            active: false,
            name: 'Voraussetzungen für Zertifikat',
            disabled: false,
            value: this.veranstaltung.voraussetzungen
          })
        }

        if (this.veranstaltung.terminueberblick && !!this.veranstaltung.terminueberblick.replace(/<[^>]*>|\s+/g, '')) {
          this.panels.push({
            active: false,
            name: 'Terminüberblick',
            disabled: false,
            value: this.veranstaltung.terminueberblick
          })
        }
        if (this.veranstaltung.organisatorisches !== null && !!this.veranstaltung.organisatorisches) {
          this.panels.push({
            active: false,
            name: 'Organisatorisches',
            disabled: false,
            value: this.veranstaltung.organisatorisches
          })
        }
        this.veranstaltung.beginnFormatted = moment(this.veranstaltung.beginn).format("DD.MM.YYYY");
        this.veranstaltung.teilnahmebeitragAwoFormatted = this.formatNumberField(this.veranstaltung.teilnahmebeitragAwo);
        this.veranstaltung.teilnahmebeitragExternFormatted = this.formatNumberField(this.veranstaltung.teilnahmebeitragExtern);
      });
    });
  }

  addMissingZeros(value: number): string {
    if (value == null) {
      return;
    }
    return value.toFixed(2);
  }

  formatNumberField(value: number): string {
    return value === 0 || value === null ? '0,00' : this.addMissingZeros(value).toString().replace('.', ',');
  }

  parseSemNr() {
    if (this.veranstaltung.seminarNr != null) {
      var tempString = this.veranstaltung.seminarNr.replace(" ", "");
      let parsedSemNr = tempString.replace("/", "-");
      window.open("http://www.seminareonlinebuchen.de/SeminarManagerNet/CustomerContent/20981/CustomerFiles/AdditionalSeminarinformation/" + parsedSemNr + ".pdf", "_blank");
    }
  }

  addToWarenkorb() {
    if (sessionStorage.getItem("LoggedInUser") != null) {
      this.benutzerService.addToWarenkorb(this.id).then(response => {
        if (response) {
          sessionStorage.setItem("Warenkorb", "Nicht_Leer");
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

}
