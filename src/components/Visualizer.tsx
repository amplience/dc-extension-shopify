import { useRouter } from "next/router";
import Slider from "./Slider";

export const Visualizer = ({ data, shop }: any) => {
     const router = useRouter();
     const contentType = router.query.contentType ? router.query.contentType.toString() : '';
  
    switch (contentType) {
      case 'collection-picker':
        return <Slider data={data} shop={shop} />;
      case 'product-picker' :
        return <Slider data={data} shop={shop} />;
        case 'product-filter' :
        return <Slider data={data} shop={shop} />;
      default:
        return <h2> Schema Name Mismatch. </h2>;
    }
  };
  
  export default Visualizer;
  