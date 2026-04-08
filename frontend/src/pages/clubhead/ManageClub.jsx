import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { headClubAPI } from '../../services/api';
import AppLayout from '../../components/AppLayout';
import { LoadingSpinner, PageHeader } from '../../components/UI';
import { Save, Globe, CheckCircle } from 'lucide-react';
import styles from './ClubHead.module.css';

const BACKEND = 'http://localhost:8080';
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

export default function ManageClub() {
  const [club, setClub] = useState(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [posterPreview, setPosterPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    headClubAPI.getMyClub()
      .then(res => {
        const c = res.data;
        setClub(c);
        setDescription(c.description || '');
        setWebsite(c.websiteLink || '');
        if (c.posterUrl) {
          setPosterPreview(`${BACKEND}/${c.posterUrl}`);
        }
      })
      .catch((err) => {
        console.error('getMyClub failed:', err?.response?.data || err.message);
      })
      .finally(() => setClubLoading(false));
  }, []);

  const handlePosterChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    if (!club?.id) {
      setSaveError('No club assigned to your account. Please contact your Faculty advisor.');
      setSaving(false);
      return;
    }

    try {
      if (selectedFile) {
        const uploadRes = await headClubAPI.uploadPoster(club.id, selectedFile);
        const newUrl = uploadRes.data.posterUrl;
        setPosterPreview(`${BACKEND}/${newUrl}`);
        setSelectedFile(null);
        setClub(prev => ({ ...prev, posterUrl: newUrl }));
      }

      await headClubAPI.updateClub({
        clubId: club.id,
        description,
        websiteLink: website,
      });

      setClub(prev => ({ ...prev, description, websiteLink: website }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Save failed:', err?.response?.data || err.message);
      setSaveError(err?.response?.data?.message || 'Save failed. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHeader title="Manage My Club" subtitle="Update your club's profile and public information" />
        
        <motion.div
          className={`${styles.section} ${styles.clubProfileSection}`}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {clubLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <h1 className={styles.clubNameBig}>
                {club?.name || 'My Club'}
              </h1>

              <div className={styles.profileFormBox}>
                <div className={styles.posterSection} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                  {posterPreview ? (
                    <div className={styles.posterPreviewContainer}>
                      <img
                        src={posterPreview}
                        alt="Club Poster"
                        className={styles.posterPreviewImage}
                      />
                      <div className={styles.posterOverlay}>
                        <label htmlFor="poster-upload" className={styles.changePosterBtn}>
                          Change Poster
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.posterEmptyState}>
                      <label htmlFor="poster-upload" className={styles.addPosterBtn}>
                        + Add Club Poster
                      </label>
                    </div>
                  )}
                  <input
                    type="file"
                    id="poster-upload"
                    hidden
                    accept="image/*"
                    onChange={handlePosterChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    className={styles.textAreaField}
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a description for your club..."
                  />
                </div>

                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label className={styles.formLabel}>
                    <Globe size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Website Link
                    <span className={styles.optionalText}> (Optional)</span>
                  </label>
                  <input
                    type="url"
                    className={styles.inputField}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://myclub.com"
                  />
                </div>

                <div className={styles.saveActionBox} style={{ marginTop: '2rem' }}>
                  {saveSuccess && (
                    <span className={styles.saveSuccessMsg}>
                      <CheckCircle size={15} /> Saved successfully
                    </span>
                  )}
                  {saveError && (
                    <span className={styles.saveErrorMsg}>{saveError}</span>
                  )}
                  <button
                    className={styles.primaryAction}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : <><Save size={15} /> Save Changes</>}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
