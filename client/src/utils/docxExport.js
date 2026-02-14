import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const exportCVToDOCX = async (cv, fileName = 'CV') => {
  try {
    const children = [];

    // Header with Name
    if (cv.personalInfo?.fullName) {
      children.push(
        new Paragraph({
          text: cv.personalInfo.fullName,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Contact Information
    const contactInfo = [];
    if (cv.personalInfo?.email) contactInfo.push(cv.personalInfo.email);
    if (cv.personalInfo?.phone) contactInfo.push(cv.personalInfo.phone);
    if (cv.personalInfo?.address) contactInfo.push(cv.personalInfo.address);
    if (cv.personalInfo?.linkedIn) contactInfo.push(`LinkedIn: ${cv.personalInfo.linkedIn}`);
    if (cv.personalInfo?.github) contactInfo.push(`GitHub: ${cv.personalInfo.github}`);
    if (cv.personalInfo?.website) contactInfo.push(`Website: ${cv.personalInfo.website}`);

    if (contactInfo.length > 0) {
      children.push(
        new Paragraph({
          text: contactInfo.join(' | '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Professional Summary
    if (cv.professionalSummary) {
      children.push(
        new Paragraph({
          text: 'Professional Summary',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: cv.professionalSummary,
          spacing: { after: 400 },
        })
      );
    }

    // Work Experience
    if (cv.workExperience?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Work Experience',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      cv.workExperience.forEach((exp) => {
        const expTitle = [];
        if (exp.position) expTitle.push(exp.position);
        if (exp.designation) expTitle.push(`(${exp.designation})`);
        if (exp.company) expTitle.push(`at ${exp.company}`);

        children.push(
          new Paragraph({
            text: expTitle.join(' '),
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          })
        );

        if (exp.startDate || exp.endDate) {
          const dateRange = `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`;
          children.push(
            new Paragraph({
              text: dateRange,
              spacing: { after: 100 },
            })
          );
        }

        if (exp.description) {
          children.push(
            new Paragraph({
              text: exp.description,
              spacing: { after: 100 },
            })
          );
        }

        if (exp.achievements?.length > 0) {
          exp.achievements.forEach((achievement) => {
            children.push(
              new Paragraph({
                text: `• ${achievement}`,
                spacing: { after: 50 },
              })
            );
          });
        }

        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      });
    }

    // Education
    if (cv.education?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Education',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      cv.education.forEach((edu) => {
        const eduTitle = [];
        if (edu.degree) eduTitle.push(edu.degree);
        if (edu.field) eduTitle.push(`in ${edu.field}`);
        if (edu.institution) eduTitle.push(`from ${edu.institution}`);

        children.push(
          new Paragraph({
            text: eduTitle.join(' '),
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          })
        );

        if (edu.startDate || edu.endDate) {
          const dateRange = `${edu.startDate || ''} - ${edu.endDate || ''}`;
          children.push(
            new Paragraph({
              text: dateRange,
              spacing: { after: 100 },
            })
          );
        }

        if (edu.gpa) {
          children.push(
            new Paragraph({
              text: `GPA: ${edu.gpa}`,
              spacing: { after: 100 },
            })
          );
        }

        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      });
    }

    // Skills
    if (cv.skills?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Skills',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      cv.skills.forEach((skill) => {
        if (skill.category) {
          children.push(
            new Paragraph({
              text: skill.category,
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 },
            })
          );
        }

        if (skill.items?.length > 0) {
          const itemsText = skill.items
            .map((item) =>
              typeof item === 'string'
                ? item
                : item?.name || ''
            )
            .filter(Boolean)
            .join(', ');

          if (itemsText) {
            children.push(
              new Paragraph({
                text: itemsText,
                spacing: { after: 200 },
              })
            );
          }
        }
      });
    }

    // Certifications
    if (cv.certifications?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Certifications',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      cv.certifications.forEach((cert) => {
        const certText = [];
        if (cert.name) certText.push(cert.name);
        if (cert.issuer) certText.push(`from ${cert.issuer}`);
        if (cert.date) certText.push(`(${cert.date})`);

        children.push(
          new Paragraph({
            text: certText.join(' '),
            spacing: { after: 100 },
          })
        );
      });
    }

    // Languages
    if (cv.languages?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Languages',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      cv.languages.forEach((lang) => {
        const langText = `${lang.language} - ${lang.proficiency}`;
        children.push(
          new Paragraph({
            text: langText,
            spacing: { after: 100 },
          })
        );
      });
    }

    // Projects
    if (cv.projects?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Projects',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      cv.projects.forEach((project) => {
        if (project.name) {
          children.push(
            new Paragraph({
              text: project.name,
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 },
            })
          );
        }

        if (project.description) {
          children.push(
            new Paragraph({
              text: project.description,
              spacing: { after: 100 },
            })
          );
        }

        if (project.technologies?.length > 0) {
          children.push(
            new Paragraph({
              text: `Technologies: ${project.technologies.join(', ')}`,
              spacing: { after: 100 },
            })
          );
        }

        if (project.link) {
          children.push(
            new Paragraph({
              text: project.link,
              spacing: { after: 100 },
            })
          );
        }

        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      });
    }

    // Hobbies
    if (cv.hobbies?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Hobbies & Interests',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: cv.hobbies.join(', '),
          spacing: { after: 200 },
        })
      );
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);

    return { success: true };
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    return { success: false, error: error.message };
  }
};
