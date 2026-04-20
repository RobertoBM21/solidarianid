'use client';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardTitle from 'react-bootstrap/CardTitle';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import { useFetchClient } from '../../lib/http/use-fetch-client';
import { startDonation } from '../../services/donations.service';

interface StartDonationFormProps {
  fundingActionId: string;
}

export default function StartDonationForm({
  fundingActionId,
}: StartDonationFormProps) {
  const fetchClient = useFetchClient();
  const [amount, setAmount] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFieldError('El importe debe ser mayor que cero.');
      return;
    }
    setFieldError('');
    setError('');
    setIsSubmitting(true);
    try {
      const payment = await startDonation(
        {
          fundingActionId,
          amount: parsedAmount,
        },
        fetchClient,
      );
      window.location.assign(payment.url);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo iniciar la donación.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Card className="border-0 shadow-sm">
      <CardBody>
        <CardTitle className="text-primary">Realizar donación</CardTitle>
        <p className="text-muted">
          Indica el importe y te redirigiremos a la pasarela de pago.
        </p>
        <Form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <FormGroup className="mb-3">
            <FormLabel>Importe</FormLabel>
            <FormControl
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setFieldError('');
              }}
              placeholder="25"
              required
              isInvalid={Boolean(fieldError)}
            />
            {fieldError ? (
              <div className="invalid-feedback d-block">{fieldError}</div>
            ) : (
              <div className="form-text">Importe en euros.</div>
            )}
          </FormGroup>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Redirigiendo…' : 'Donar'}
          </Button>
        </Form>
        {error ? (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        ) : null}
      </CardBody>
    </Card>
  );
}
