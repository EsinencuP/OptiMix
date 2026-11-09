import type {NextConfig} from 'next';
const config:NextConfig={
 trailingSlash:true,
 experimental:{globalNotFound:true},
 async redirects(){return [
  {source:'/',destination:'/en/',permanent:true},
  {source:'/404.html',destination:'/en/404/',permanent:true},
  ...['contact','privacy','portfolio','services','solutions','projects','demo'].map(segment=>({source:`/${segment}/:path*`,destination:`/en/${segment}/:path*/`,permanent:true})),
 ];},
};
export default config;
