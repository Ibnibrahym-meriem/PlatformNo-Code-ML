import React, { useState } from 'react';
import dataService from '../../../services/data.service';

const ManualTab = ({ onSuccess }) => {
  // --- ÉTATS ---
  // 1. Zone de texte pour le CSV brut
  const [csvText, setCsvText] = useState("Name,Age,Salary\nJohn,25,50000\nJane,30,60000\nBob,35,70000");
  
  // 2. Données structurées pour le tableau (Matrice)
  // Headers : Liste des noms de colonnes
  const [headers, setHeaders] = useState(["Name", "Age", "Salary"]);
  // Rows : Liste de listes (ex: [["John", "25", "50000"], ...])
  const [rows, setRows] = useState([
    ["John", "25", "50000"],
    ["Jane", "30", "60000"],
    ["Bob", "35", "70000"]
  ]);

  const [loading, setLoading] = useState(false);

  // --- LOGIQUE CSV ---
  const handleParseCsv = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return;

    // La première ligne devient les en-têtes
    const newHeaders = lines[0].split(',').map(h => h.trim());
    
    // Les lignes suivantes deviennent les données
    const newRows = lines.slice(1).map(line => {
      const cells = line.split(',');
      // On s'assure que la ligne a le bon nombre de colonnes (remplissage vide si besoin)
      while (cells.length < newHeaders.length) cells.push("");
      return cells.map(c => c.trim());
    });

    setHeaders(newHeaders);
    setRows(newRows);
  };

  // --- LOGIQUE ÉDITION TABLEAU ---
  
  // Changer le nom d'une colonne
  const handleHeaderChange = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  // Changer la valeur d'une cellule
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  // Supprimer une ligne
  const handleDeleteRow = (rowIndex) => {
    const newRows = rows.filter((_, index) => index !== rowIndex);
    setRows(newRows);
  };

  // Ajouter une ligne vide
  const handleAddRow = () => {
    const emptyRow = new Array(headers.length).fill("");
    setRows([...rows, emptyRow]);
  };

  // Ajouter une colonne (Optionnel, pour être complet)
  const handleAddColumn = () => {
    setHeaders([...headers, "New Column"]);
    setRows(rows.map(row => [...row, ""]));
  };

  // --- ENVOI AU BACKEND ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Transformation de la Matrice (Arrays) en Liste d'Objets (JSON) pour le Backend
      const formattedData = rows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          // On essaie de convertir en nombre si c'est possible, sinon on garde la string
          const val = row[index];
          obj[header] = isNaN(Number(val)) || val === "" ? val : Number(val);
        });
        return obj;
      });

      // Envoi
      const res = await dataService.ingestManual(formattedData);
      onSuccess(res.data);
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8">
      
      {/* SECTION 1 : PASTE CSV */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex justify-between items-end mb-2">
          <label className="text-sm font-bold text-gray-700">Paste CSV Data</label>
          <button 
            onClick={handleParseCsv}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 transition shadow-sm text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Parse CSV
          </button>
        </div>
        <textarea 
          className="w-full h-24 border border-gray-300 rounded-xl p-3 font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="Name,Age,Salary..."
        />
      </div>

      {/* SECTION 2 : TABLE EDITOR */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-800">Manual Data Editor</h3>
          <span className="text-xs text-gray-400">{rows.length} rows, {headers.length} columns</span>
        </div>
        
        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm max-h-[400px]">
          <table className="w-full text-sm text-left">
            {/* Headers */}
            <thead className="bg-gray-100 text-gray-700 uppercase font-bold sticky top-0 z-10">
              <tr>
                {headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 min-w-[150px]">
                    <input 
                      type="text" 
                      value={header}
                      onChange={(e) => handleHeaderChange(i, e.target.value)}
                      className="bg-transparent border-b border-transparent focus:border-brand-500 outline-none w-full text-gray-700 font-bold placeholder-gray-400"
                      placeholder={`Col ${i+1}`}
                    />
                  </th>
                ))}
                <th className="px-4 py-3 w-10 text-center">
                   <button onClick={handleAddColumn} className="text-brand-500 hover:text-brand-700 font-bold text-lg" title="Add Column">+</button>
                </th>
              </tr>
            </thead>
            
            {/* Body */}
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 group transition">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-4 py-2">
                      <input 
                        type="text" 
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="w-full p-1.5 border border-gray-200 rounded-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition bg-transparent"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <button 
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="text-gray-300 hover:text-red-500 transition p-1"
                      title="Delete Row"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rows.length === 0 && (
             <div className="p-8 text-center text-gray-400 italic">
               No data. Add a row or parse CSV.
             </div>
          )}
        </div>

        {/* Bouton Ajouter Ligne */}
        <div className="mt-2">
           <button 
             onClick={handleAddRow}
             className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 px-2 py-1 rounded transition"
           >
             <span className="text-lg">+</span> Add Row
           </button>
        </div>
      </div>

      {/* SECTION 3 : SUBMIT BUTTON */}
      <button 
        onClick={handleSubmit} 
        disabled={loading || rows.length === 0} 
        className="w-full bg-brand-500 text-white py-3.5 rounded-xl font-bold hover:bg-brand-600 transition disabled:opacity-50 shadow-lg shadow-orange-100 flex justify-center items-center gap-2"
      >
        {loading ? (
           <>Processing...</>
        ) : (
           <>Load {rows.length} Rows</>
        )}
      </button>

    </div>
  );
};

export default ManualTab;