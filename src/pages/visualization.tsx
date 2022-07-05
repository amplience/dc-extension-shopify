import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { DefaultContentBody } from "dc-delivery-sdk-js";
import { init } from "dc-visualization-sdk";
import Visualizer from "src/components/Visualizer";

type props = {
  shop: string
  host: string
}

export const VisualizationPage = ({shop, host} : props) => {
  const [content, setContent] = useState<DefaultContentBody | any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadVizContent = async () => {
    try {
      const sdk = await init();
      const model = await sdk.form.get();
      setContent(model.content);

      sdk.form.changed((model) => {
        setContent(model.content);
      });
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVizContent();
  },[]);

  if (loading) return <h2>Loading</h2>;

  if (error) return <h2>Something went wrong loading content.</h2>;

  return <Visualizer data={content} shop={shop} />;
};

export default VisualizationPage;
