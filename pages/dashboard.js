export async function getStaticProps() {
  return {
    redirect: {
      destination: '/dashboard.html',
      permanent: false
    }
  };
}

export default function DashboardPage() {
  return null;
}
