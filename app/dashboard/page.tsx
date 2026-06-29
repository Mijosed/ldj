'use client'

import { useState, useEffect } from "react";
import Navbar from '../../components/Navbar'
export default function Dashboard (){

    const [compteur , setCompteur] = useState(1);
    const [input, setInput] = useState('');
    
    
    const addition = () => {
        setCompteur(compteur + 1 );
        console.log(compteur);
    }

    // useEffect(() => {
    //     alert(`J'aurai ${compteur}€ à payer 💸`)
    // }, []);

    const handleInputChange = (event:any) => {
        setInput(event.target.value);
    }

    const mapSrc = <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5250.95512063158!2d2.382453893372452!3d48.849103195394505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e6720d9c7af387%3A0x5891d8d62e8535c7!2sESGI%2C%20%C3%89cole%20Sup%C3%A9rieure%20de%20G%C3%A9nie%20Informatique!5e0!3m2!1sfr!2sfr!4v1713523754982!5m2!1sfr!2sfr" width="700" height="400" style={{ border: '0' }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe> ;

    return(
        <div className="flex flex-col items-center justify-center">
        <Navbar/>
        <h1>Wawww les routes sur Next JS c'est de la frappe atomique</h1>
        <input name="myInput" type='text' onChange={handleInputChange} className=" border-2 rounded-sm border-black"></input>
        <button className='btn bg-slate-800 rounded-md p-2 mr-3' onClick={addition}>Addition</button>
        <button className='btn bg-slate-800 rounded-md p-2' onClick={()=>setCompteur(compteur -1)}>Soustraction</button>
        <p>{compteur}</p>
        <p>{input}</p>
        <div>
            {mapSrc}
        </div>
        </div>

    );
}