import { useRouter } from "next/router";
import Slider from "./Slider";

export const Visualizer = ({ data }: any) => {
     const router = useRouter();
     const contentType = router.query.contentType ? router.query.contentType.toString() : '';
  
    console.log(data);
    console.log(contentType)
  
    switch (contentType) {
      case 'collection-picker':
        return <Slider data={data} />;
      case 'product-picker' :
        return <Slider data={data} />;
        case 'product-filter' :
        return <Slider data={data} />;
      default:
        return <h2> Schema Name Mismatch. </h2>;
    }
  };
  
  export default Visualizer;
  