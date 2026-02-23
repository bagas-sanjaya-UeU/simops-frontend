(function () {
  function drawJustifiedText(pdf, text, x, startY, maxWidth, lineHeight) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    let y = startY;

    lines.forEach((line, index) => {
      const isLastLine = index === lines.length - 1;
      const words = String(line).trim().split(/\s+/).filter(Boolean);

      if (isLastLine || words.length <= 1) {
        pdf.text(line, x, y);
        y += lineHeight;
        return;
      }

      const wordsWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0);
      const totalGapWidth = Math.max(maxWidth - wordsWidth, 0);
      const gap = totalGapWidth / (words.length - 1);

      let cursorX = x;
      words.forEach((word, wordIndex) => {
        pdf.text(word, cursorX, y);
        if (wordIndex < words.length - 1) {
          cursorX += pdf.getTextWidth(word) + gap;
        }
      });

      y += lineHeight;
    });

    return y;
  }

  function generatePersetujuanPdfTemplate(payload) {
    const { namaMenyetujui, noHp, statusPersetujuan, signatureDataUrl } = payload || {};

    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('Library PDF belum siap. Coba ulang beberapa detik lagi.');
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const statusDisplay = statusPersetujuan === 'Bersedia' ? 'BERSEDIA' : 'TIDAK BERSEDIA';
    const tanggalLengkap = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.text('LEMBAR PERSETUJUAN MENJADI RESPONDEN', 105, 16, { align: 'center' });

    pdf.setFont('times', 'bolditalic');
    pdf.setFontSize(10);
    pdf.text('(Informed Consent)', 105, 22, { align: 'center' });

    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);

    const p1 = 'Saya telah membaca atau memperoleh penjelasan terkait penelitian ini, sepenuhnya menyadari, memahami, dan mengerti tentang tujuan dan manfaat dari penelitian yang akan dilakukan. Saya tidak akan membocorkan informasi kepada siapa pun yang diperoleh pada saat menerima penjelasan materi yang diberikan pada saat pelaksanaan program yang dilakukan oleh peneliti, maka saya yang bertanda tangan di bawah ini';
    const p2 = `“${statusDisplay}*) ikut dalam penelitian ini yang berjudul “PENGARUH SISTEM INFORMASI SIMULTANEOUS OPERATIONS (SIMOPS) TERINTEGRASI BERBASIS WEBSITE TERHADAP SAFETY AWARENESS PARA PEKERJA DI PT PETROKIMIA GRESIK”.`; 
    const p3 = 'Saya sukarela memilih untuk ikut serta dalam penelitian ini tanpa ada tekanan/paksaan dari pihak lain.';
    const p4 = 'Demikian pernyataan ini dibuat dengan penuh kesadaran dan dapat digunakan sebagaimana mestinya.';

    let y = 32;
    y = drawJustifiedText(pdf, p1, 22, y, 168, 5) + 2;

    y += 2;
    pdf.text('Nama                      :', 22, y);
    pdf.text(String(namaMenyetujui || '-'), 64, y);
    pdf.text('No. HP / WhatsApp   :', 22, y + 8);
    pdf.text(String(noHp || '-'), 64, y + 8);

    y += 16;
    pdf.setFont('times', 'bold');
    y = drawJustifiedText(pdf, p2, 22, y, 168, 5);
    pdf.setFont('times', 'normal');
    y += 2;

    y = drawJustifiedText(pdf, p3, 22, y, 168, 5) + 2;
    y = drawJustifiedText(pdf, p4, 22, y, 168, 5) + 2;

    y += 12;
    pdf.text(`Gresik, ${tanggalLengkap}`, 118, y);

    y += 18;
    pdf.text('Peneliti', 48, y, { align: 'center' });
    pdf.text('Responden', 140, y, { align: 'center' });

    pdf.text('(Renata Dewi Puspitasari)', 48, y + 50, { align: 'center' });
    pdf.text(`(${String(namaMenyetujui || '').trim() || '........................................'})`, 140, y + 50, { align: 'center' });

    if (signatureDataUrl) {
      pdf.addImage(signatureDataUrl, 'PNG', 108, y + 5, 64, 32);
    }

    return pdf.output('datauristring');
  }

  window.generatePersetujuanPdfTemplate = generatePersetujuanPdfTemplate;
})();
