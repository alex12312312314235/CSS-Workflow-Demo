Attribute VB_Name = "SplitFilterWords"
' ============================================================
' VBA Macro: SplitFilterWords
'
' Splits underscore-delimited text in column K into
' separate cells in columns L, M, N.
'
' Example: "WRAP_TOMATO_INDIAN" in K2 becomes:
'   L2 = WRAP
'   M2 = TOMATO
'   N2 = INDIAN
'
' If only 1 word (no underscores), it goes into L only.
' If 2 words, they go into L and M.
' ============================================================

Sub SplitFilterWords()

    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim cellValue As String
    Dim parts() As String

    Set ws = ActiveSheet

    ' Find last row with data in column K
    lastRow = ws.Cells(ws.Rows.Count, "K").End(xlUp).Row

    ' Optional: Add headers in L1, M1, N1
    ws.Range("L1").Value = "Filter_1"
    ws.Range("M1").Value = "Filter_2"
    ws.Range("N1").Value = "Filter_3"

    ' Loop through each row starting from row 2 (skip header)
    For i = 2 To lastRow

        cellValue = Trim(ws.Cells(i, "K").Value)

        ' Clear target cells first
        ws.Cells(i, "L").Value = ""
        ws.Cells(i, "M").Value = ""
        ws.Cells(i, "N").Value = ""

        If cellValue <> "" Then
            ' Split by underscore
            parts = Split(cellValue, "_")

            ' Place each part into the corresponding column
            If UBound(parts) >= 0 Then ws.Cells(i, "L").Value = parts(0)
            If UBound(parts) >= 1 Then ws.Cells(i, "M").Value = parts(1)
            If UBound(parts) >= 2 Then ws.Cells(i, "N").Value = parts(2)
        End If

    Next i

    MsgBox "Done! Split " & (lastRow - 1) & " rows into columns L, M, N.", vbInformation, "Split Complete"

End Sub
