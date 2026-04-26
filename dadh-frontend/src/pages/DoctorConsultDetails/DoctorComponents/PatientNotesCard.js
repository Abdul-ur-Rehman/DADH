import React, { useEffect, useState, useCallback } from "react";
import "./PatientNotesCard.css";
import { useParams } from "react-router-dom";

const PatientNotesCard = () => {
  const [AIScribeNote, setAIScribeNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const REACT_APP_BACKEND_URL = `http://localhost:5001/api`;
  const { id } = useParams();
  const consultationId = id;

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const getNotes = async () => {
    try{
      const response = await fetch(`${REACT_APP_BACKEND_URL}/consultations/get/AIScribeNote/:${consultationId}`, {
        method: "GET",
      })
      if (response.ok) {
        const data = await response.json();
        setAIScribeNote(data.data?.AIScribeNote || "");
      } else {
        console.error("Error in fetching notes", response.statusText);
      }
    }
    catch(err){
      console.log("Error in getting notes", err);
    }
  }

  const saveNotes = useCallback(async () => {
    if (!AIScribeNote.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(
        `${REACT_APP_BACKEND_URL}/consultations/AIScribeNote/add`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ AIScribeNote, consultationId }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
      } else {
        const errorData = await response.json();
        console.error("Error in saving note", errorData.message);
      }
    } catch (err) {
      console.log("Error in saving notes", err);
    } finally {
      setIsSaving(false);
    }
  }, [AIScribeNote, consultationId]);

  // Debounced version of saveNotes
  const debouncedSaveNotes = useCallback(
    debounce(saveNotes, 1000), // 1 second delay
    [saveNotes]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAIScribeNote(value);
    debouncedSaveNotes();
  };

  // const fetchAIScribeNotes = async () => {
  //   try {
  //     const response = await fetch(
  //       `${REACT_APP_BACKEND_URL}/consultations/AIScribeNote/get`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ consultationId }),
  //       }
  //     );
      
  //     if (response.ok) {
  //       const data = await response.json();
  //       setAIScribeNote(data.data?.AIScribeNote || "");
  //     }
  //   } catch (err) {
  //     console.log("Error in fetching notes", err);
  //   }
  // };

  // useEffect(() => {
  //   fetchAIScribeNotes();
  // }, []);

  return (
    <div className="notes-card">
      <div className="notes-header">
      <h5 className="mb-0 text-left text-lg font-semibold"> Patient Notes </h5>
        <div className="notes-status">
          {isSaving && <span className="saving-indicator">Saving...</span>}
        </div>
      </div>

      <textarea
        className="notes-textarea"
        value={AIScribeNote}
        onChange={handleInputChange}
        placeholder="Type your notes here..."
      />

      {/* <div className="notes-footer">
        <button className="ai-scribe-btn" onClick={saveNotes}>
          {isSaving ? "Saving..." : "Save Now"}
        </button>
      </div> */}
    </div>
  );
};

export default PatientNotesCard;