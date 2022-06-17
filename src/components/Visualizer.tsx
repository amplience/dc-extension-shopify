import Slider from "./Slider";

export const Visualizer = ({ data }: any) => {
    // const router = useRouter();
    // const stagingEnvironment = router.query.vse ? router.query.vse.toString() : '';
    const schemaURL = 'https://schema.amplience-extension.myshopify.com/';
  
    console.log(data);
  
    switch (data._meta.schema.replace(schemaURL, '')) {
      case 'collection-carousel':
        return <Slider data={data} />;
      case 'product-picker-carousel' :
        return <Slider data={data} />;
        case 'product-filter-carousel' :
        return <Slider data={data} />;
      default:
        return <h2> Schema Name Mismatch. </h2>;
    }
  };
  
  export default Visualizer;
  