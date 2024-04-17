import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'ds-kware-document-viewer',
  templateUrl: './kware-document-viewer.component.html',
  styleUrls: ['./kware-document-viewer.component.scss']
})
export class KwareDocumentViewerComponent implements OnChanges {
  @Input() docURL = '';
  @Input() locale = 'en';
  @Input() closeViewer: () => void;
  @Input() isMobile: boolean;
  @Input() fileMeta;
  @Input() viewerPanelsStatus: any;

  @ViewChild('documentViewer') documentViewer: any;

  iframeURL?: SafeResourceUrl = undefined;

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.docURL.currentValue) {
      this.iframeURL =
        this.domSanitizer
          .bypassSecurityTrustResourceUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${changes.docURL.currentValue}&StartOn=1&Print=0&EmbedCode=0&ui=${this.locale}`);

      if (this.documentViewer) {
        this.documentViewer.src =
          this.domSanitizer.
            bypassSecurityTrustResourceUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${changes.docURL.currentValue}&StartOn=1&Print=0&EmbedCode=0&ui=${this.locale}`);
      }
    }
  }

  downloadDocument() {
    let link = document.createElement('a');
    link.href = this.docURL;
    link.download = `${this.fileMeta.name}.${this.fileMeta.format}`;
    link.click();
    URL.revokeObjectURL(this.docURL);
  }

  async printDocument() {
    const fileBuffer = await
      fetch((this.docURL)).then(res => res.arrayBuffer());
    let blob = new Blob([fileBuffer], { type: this.fileMeta.format });
    const blobUrl = window.URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow.print();
  }
}
