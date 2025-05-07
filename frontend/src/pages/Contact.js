import React from 'react';
import { useParams } from 'react-router-dom';

export default function Contact() {
  const { email } = useParams();
  const vcfLink = \`/api/user/\${email}/vcf\`;

  return (
    <div>
      <h1>vCard for {email}</h1>
      <a href={vcfLink} download>Download vCard</a>
    </div>
  );
}
