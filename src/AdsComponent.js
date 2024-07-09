import React, { useEffect } from 'react';
import App from './App';

const AdsComponent = (props) => {
    const { dataAdSlot } = props;

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            //App.waitCondition(() => {return window.adsbygoogle}, window.adsbygoogle.push());
        }
        catch (e) {
            console.log(e);
        }
    }, []);

    //data-adtest="on"

    return (
        <ins className="adsbygoogle"
            style={{ display: "block", border: "1px solid black"}}
            data-ad-client="ca-pub-4411095675092973"
            data-ad-slot={dataAdSlot}
            data-ad-format="auto"
            data-full-width-responsive="true">
        </ins>
    );
};

export default AdsComponent;