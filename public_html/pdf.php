<?php
require_once('tcpdf.php');

// create new PDF document
$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
$pdf->SetMargins(15, 15, 15);
$pdf->setImageScale(1);
if (@file_exists(dirname(__FILE__).'/lang/eng.php')) {
    require_once(dirname(__FILE__).'/lang/eng.php');
    $pdf->setLanguageArray($l);
}

$pdf->setFontSubsetting(true);
$pdf->SetFont('dejavusans', '', 14, '', true);
$pdf->AddPage();
$html = ''
        . '<div style="width:100%; text-align:center; text-transform: uppercase; font-weight: bold;">'
        . 'Ситуационный план'
        . '</div>'
        . '<div style="width:100%; text-align:left; font-weight: normal; font-size:10pt;">'
        . '<span style="font-weight:bold">Земельный участок, расположенный по адресу:<br /></span>'
        . '<span style="font-weight:normal">'.$_GET['address'].'</span>'
        . '</div>'
        . '<img src="https://maps.googleapis.com/maps/api/staticmap?center='.$_GET['center'].'&zoom='.$_GET['zoom'].'&size=650x650&maptype=satellite&key=AIzaSyCEPiUyIgRu4MwjQTvu-b5GeIyTtIy0BCs&language=ru&format=png32" />'
        . '<div style="width:100%; text-align:center; font-weight: normal; font-size:10pt;">'
        . 'Масштаб 1:'.$_GET['scale']
        . '</div>';

$pdf->writeHTML($html, true, false, true, false, 'center');
$pdf->Output('example_001.pdf', 'I');

?>
