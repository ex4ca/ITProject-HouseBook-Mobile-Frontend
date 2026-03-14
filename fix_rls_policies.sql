-- Policy to allow Tradies to read PropertyImages for properties they are assigned to
-- We join JobTradies and Jobs to verify the Tradie has an ACCEPTED job on the property.

CREATE POLICY "Tradies can view images for assigned properties" 
ON public."PropertyImages"
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public."JobTradies" jt
    JOIN public."Jobs" j ON j.id = jt.job_id
    JOIN public."Tradesperson" t ON t.tradie_id = jt.tradie_id
    WHERE j.property_id = "PropertyImages".property_id
      AND t.user_id = auth.uid()
      AND jt.status = 'ACCEPTED'
  )
);
